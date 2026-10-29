package main

import (
	"context"
	"fmt"
	"io"
	"net"
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"
	"os/exec"
	"os/signal"
	"path/filepath"
	"strings"
	"syscall"
	"time"
)

const (
	defaultFrontendPort = 5174
	defaultBackendPort  = 8080
	healthCheckPath     = "/api/health"
)

type appConfig struct {
	baseDir      string
	distDir      string
	phpBinary    string
	routerScript string
	frontendPort int
	backendPort  int
	backendURL   *url.URL
}

func main() {
	printBanner()

	cfg, err := resolveConfig()
	if err != nil {
		fmt.Fprintf(os.Stderr, "[ERROR] Configuration failure: %v\n", err)
		os.Exit(1)
	}

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, os.Interrupt, syscall.SIGTERM)

	backendCmd, hasBackend := startBackend(cfg)
	if hasBackend {
		defer stopProcess(backendCmd)
	}

	waitForBackendHealth(cfg)

	server := startFrontendServer(cfg)
	defer func() {
		shutdownCtx, sCancel := context.WithTimeout(context.Background(), 3*time.Second)
		defer sCancel()

		_ = server.Shutdown(shutdownCtx)
	}()

	frontendURL := fmt.Sprintf("http://127.0.0.1:%d", cfg.frontendPort)
	fmt.Printf("[OK] Frontend server running at: %s\n", frontendURL)
	fmt.Printf("[OK] Backend API proxy target: http://127.0.0.1:%d\n", cfg.backendPort)

	go launchBrowser(frontendURL)

	fmt.Println("\n[INFO] Application running. Press Ctrl+C to close WP Exam.")

	select {
	case <-sigChan:
		fmt.Println("\n[INFO] Shutdown signal received. Closing services...")
	case <-ctx.Done():
		fmt.Println("\n[INFO] Context terminated.")
	}
}

func printBanner() {
	fmt.Println("====================================================")
	fmt.Println("  WP Exam & Modern Quiz Engine - Desktop Runner")
	fmt.Println("====================================================")
}

func resolveConfig() (*appConfig, error) {
	exePath, err := os.Executable()
	if err != nil {
		return nil, err
	}

	baseDir := filepath.Dir(exePath)

	distDir := filepath.Join(baseDir, "dist")
	hasDist := fileExists(distDir)
	if !hasDist {
		distDir = filepath.Join(baseDir, "..", "dist")
	}

	phpBinary := filepath.Join(baseDir, "php", "php.exe")
	hasPhp := fileExists(phpBinary)
	if !hasPhp {
		pathBinary, pErr := exec.LookPath("php")
		if pErr == nil {
			phpBinary = pathBinary
		}
	}

	routerScript := filepath.Join(baseDir, "router.php")
	hasRouter := fileExists(routerScript)
	if !hasRouter {
		routerScript = filepath.Join(baseDir, "..", "router.php")
	}

	targetURL, err := url.Parse(fmt.Sprintf("http://127.0.0.1:%d", defaultBackendPort))
	if err != nil {
		return nil, err
	}

	return &appConfig{
		baseDir:      baseDir,
		distDir:      distDir,
		phpBinary:    phpBinary,
		routerScript: routerScript,
		frontendPort: defaultFrontendPort,
		backendPort:  defaultBackendPort,
		backendURL:   targetURL,
	}, nil
}

func startBackend(cfg *appConfig) (*exec.Cmd, bool) {
	hasPhp := fileExists(cfg.phpBinary)
	if !hasPhp {
		fmt.Println("[WARN] Portable PHP runtime not found. Attempting static-only mode.")

		return nil, false
	}

	hasRouter := fileExists(cfg.routerScript)
	if !hasRouter {
		fmt.Println("[WARN] router.php not found. Backend API will not be available.")

		return nil, false
	}

	hostArg := fmt.Sprintf("127.0.0.1:%d", cfg.backendPort)
	cmd := exec.Command(cfg.phpBinary, "-S", hostArg, cfg.routerScript)
	cmd.Dir = filepath.Dir(cfg.routerScript)
	cmd.Stdout = io.Discard
	cmd.Stderr = io.Discard

	applyHiddenWindow(cmd)

	err := cmd.Start()
	if err != nil {
		fmt.Printf("[WARN] Failed to start PHP backend: %v\n", err)

		return nil, false
	}

	fmt.Printf("[OK] PHP Backend process started on http://%s (PID: %d)\n", hostArg, cmd.Process.Pid)

	return cmd, true
}

func waitForBackendHealth(cfg *appConfig) {
	healthEndpoint := fmt.Sprintf("http://127.0.0.1:%d%s", cfg.backendPort, healthCheckPath)
	client := &http.Client{Timeout: 800 * time.Millisecond}

	fmt.Print("[INFO] Waiting for backend readiness...")

	for i := 0; i < 20; i++ {
		resp, err := client.Get(healthEndpoint)
		if err == nil {
			isOk := (resp.StatusCode == http.StatusOK)
			_ = resp.Body.Close()

			if isOk {
				fmt.Println(" ready!")

				return
			}
		}

		fmt.Print(".")
		time.Sleep(300 * time.Millisecond)
	}

	fmt.Println(" continuing without health confirmation.")
}

func startFrontendServer(cfg *appConfig) *http.Server {
	proxy := httputil.NewSingleHostReverseProxy(cfg.backendURL)
	fileServer := http.FileServer(http.Dir(cfg.distDir))

	mux := http.NewServeMux()

	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		isAPI := strings.HasPrefix(r.URL.Path, "/api/")
		if isAPI {
			proxy.ServeHTTP(w, r)

			return
		}

		isWpJSON := strings.HasPrefix(r.URL.Path, "/wp-json/")
		if isWpJSON {
			proxy.ServeHTTP(w, r)

			return
		}

		candidatePath := filepath.Join(cfg.distDir, filepath.Clean(r.URL.Path))
		hasCandidate := fileExists(candidatePath)
		if hasCandidate {
			fileServer.ServeHTTP(w, r)

			return
		}

		indexPath := filepath.Join(cfg.distDir, "index.html")
		hasIndex := fileExists(indexPath)
		if hasIndex {
			http.ServeFile(w, r, indexPath)

			return
		}

		http.NotFound(w, r)
	})

	server := &http.Server{
		Addr:    fmt.Sprintf("127.0.0.1:%d", cfg.frontendPort),
		Handler: mux,
	}

	listener, err := net.Listen("tcp", server.Addr)
	if err != nil {
		fmt.Printf("[WARN] Port %d busy, falling back: %v\n", cfg.frontendPort, err)

		return server
	}

	go func() {
		_ = server.Serve(listener)
	}()

	return server
}

func launchBrowser(targetURL string) {
	time.Sleep(500 * time.Millisecond)

	chromePath, hasChrome := findChrome()
	if hasChrome {
		fmt.Printf("[OK] Launching Google Chrome in fullscreen: %s\n", targetURL)
		cmd := exec.Command(chromePath, "--start-fullscreen", fmt.Sprintf("--app=%s", targetURL))
		applyHiddenWindow(cmd)

		err := cmd.Start()
		if err == nil {
			return
		}
	}

	edgePath, hasEdge := findEdge()
	if hasEdge {
		fmt.Printf("[OK] Launching Microsoft Edge in fullscreen: %s\n", targetURL)
		cmd := exec.Command(edgePath, "--start-fullscreen", fmt.Sprintf("--app=%s", targetURL))
		applyHiddenWindow(cmd)

		err := cmd.Start()
		if err == nil {
			return
		}
	}

	fmt.Printf("[OK] Launching default browser: %s\n", targetURL)
	fallbackCmd := exec.Command("cmd", "/c", "start", targetURL)
	applyHiddenWindow(fallbackCmd)
	_ = fallbackCmd.Start()
}

func findChrome() (string, bool) {
	candidates := []string{
		filepath.Join(os.Getenv("ProgramFiles"), "Google", "Chrome", "Application", "chrome.exe"),
		filepath.Join(os.Getenv("ProgramFiles(x86)"), "Google", "Chrome", "Application", "chrome.exe"),
		filepath.Join(os.Getenv("LocalAppData"), "Google", "Chrome", "Application", "chrome.exe"),
	}

	for _, path := range candidates {
		hasFile := fileExists(path)
		if hasFile {
			return path, true
		}
	}

	return "", false
}

func findEdge() (string, bool) {
	candidates := []string{
		filepath.Join(os.Getenv("ProgramFiles(x86)"), "Microsoft", "Edge", "Application", "msedge.exe"),
		filepath.Join(os.Getenv("ProgramFiles"), "Microsoft", "Edge", "Application", "msedge.exe"),
	}

	for _, path := range candidates {
		hasFile := fileExists(path)
		if hasFile {
			return path, true
		}
	}

	return "", false
}

func fileExists(path string) bool {
	info, err := os.Stat(path)
	if err != nil {
		return false
	}

	isDir := info.IsDir()
	if isDir {
		return true
	}

	return true
}

func stopProcess(cmd *exec.Cmd) {
	hasCmd := (cmd != nil)
	if hasCmd {
		hasProcess := (cmd.Process != nil)
		if hasProcess {
			fmt.Printf("[INFO] Stopping backend process (PID: %d)...\n", cmd.Process.Pid)
			_ = cmd.Process.Kill()
		}
	}
}
