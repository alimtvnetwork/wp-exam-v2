/**
 * Job Role Definitions and Technical Assessment MCQs.
 *
 * Provides centralized job roles and role-specific technical evaluation MCQs
 * across the Candidate Portal (/portal/:token) and Admin Pipeline.
 */

import { unifiedFetch } from '@/utils/api-client';

export interface ScreeningQuestionOption {
  val: string;
  label: string;
}

export interface FirstPhaseQuestion {
  question: string;
  hint: string;
  briefingNotes: string[];
  options: ScreeningQuestionOption[];
  correctAnswer: string;
}

export interface AssessmentQuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface JobRole {
  id: string;
  title: string;
  department: string;
  type: string;
  description: string;
  durationMinutes?: number;
  isCustom?: boolean;
  firstPhaseQuestion: FirstPhaseQuestion;
  secondPhaseQuestions: AssessmentQuizQuestion[];
}

export const SEEDED_JOB_ROLES: JobRole[] = [
  {
    id: 'frontend-developer',
    title: 'Frontend Developer (React / TypeScript)',
    department: 'Frontend Engineering',
    type: 'Full-Time',
    description: 'Build high-performance, accessible React user interfaces with TypeScript, Tailwind CSS, and state management.',
    durationMinutes: 30,
    firstPhaseQuestion: {
      question: 'Which React hook should be used to memoize an expensive calculation between renders?',
      hint: 'Think of the hook that caches a computed value until one of its dependencies changes.',
      briefingNotes: [
        'State memoization and rendering performance in modern React 18+.',
        'Dependency array hygiene to avoid stale closures and infinite re-renders.',
      ],
      options: [
        { val: 'useMemo', label: 'useMemo(() => computeExpensiveValue(a, b), [a, b])' },
        { val: 'useCallback', label: 'useCallback(() => computeExpensiveValue(a, b), [a, b])' },
        { val: 'useEffect', label: 'useEffect(() => { computeExpensiveValue(a, b); }, [a, b])' },
        { val: 'useRef', label: 'useRef(computeExpensiveValue(a, b))' },
      ],
      correctAnswer: 'useMemo',
    },
    secondPhaseQuestions: [
      {
        id: 'fe_q1',
        question: 'What is the primary benefit of TypeScript Discriminated Unions in state management?',
        options: [
          'Enables the TypeScript compiler to enforce exhaustive, safe branching across distinct state variants',
          'Automatically compresses runtime JavaScript bundle size by 50%',
          'Bypasses the React Virtual DOM diffing algorithm',
          'Converts asynchronous promises into synchronous function calls',
        ],
        correctAnswer: 'Enables the TypeScript compiler to enforce exhaustive, safe branching across distinct state variants',
        explanation: 'Discriminated unions with a shared literal tag provide compile-time guarantees that all possible states are handled.',
      },
      {
        id: 'fe_q2',
        question: 'How does React 18 automatic batching optimize state updates inside asynchronous promises and timeouts?',
        options: [
          'Batches multiple state setter calls into a single render pass automatically',
          'Prevents any re-rendering until the user manually triggers a refresh',
          'Requires wrap-around ReactDOM.unstable_batchedUpdates() calls',
          'Forces all state updates to execute synchronously on the main thread',
        ],
        correctAnswer: 'Batches multiple state setter calls into a single render pass automatically',
        explanation: 'React 18 batches state updates across event handlers, promises, and timeouts by default.',
      },
      {
        id: 'fe_q3',
        question: 'Which CSS property creates a new stacking context without repositioning or transforming an element?',
        options: [
          'isolation: isolate',
          'display: flex',
          'overflow: visible',
          'position: static',
        ],
        correctAnswer: 'isolation: isolate',
        explanation: 'isolation: isolate creates a clean local stacking context without changing layout coordinates.',
      },
    ],
  },
  {
    id: 'wordpress-specialist',
    title: 'WordPress & WooCommerce Core Developer',
    department: 'CMS Engineering',
    type: 'Full-Time',
    description: 'Architect custom WordPress plugins, REST API extensions, custom post types, and WooCommerce modules.',
    durationMinutes: 30,
    firstPhaseQuestion: {
      question: 'Which WordPress action hook is the canonical location for registering custom REST API endpoints?',
      hint: 'This hook fires when the WordPress REST API is being loaded and initialized.',
      briefingNotes: [
        'Decoupled headless WordPress REST routing and permission callbacks.',
        'Secure capability and nonce verification on custom plugin controllers.',
      ],
      options: [
        { val: 'rest_api_init', label: 'rest_api_init (canonical REST route registration hook)' },
        { val: 'init', label: 'init (general WordPress initialization hook)' },
        { val: 'wp_loaded', label: 'wp_loaded (fires once WordPress is fully configured)' },
        { val: 'admin_init', label: 'admin_init (fires only inside the WP admin dashboard)' },
      ],
      correctAnswer: 'rest_api_init',
    },
    secondPhaseQuestions: [
      {
        id: 'wp_q1',
        question: 'In a decoupled WordPress & React architecture, what HTTP header authenticates nonced REST requests?',
        options: [
          'X-WP-Nonce',
          'Authorization-Token',
          'WP-Secret-Key',
          'X-CSRF-Token',
        ],
        correctAnswer: 'X-WP-Nonce',
        explanation: 'The WordPress REST API uses X-WP-Nonce to verify current user sessions and prevent CSRF.',
      },
      {
        id: 'wp_q2',
        question: 'Which function must always be used to sanitize and prepare parameterized SQL queries in WordPress?',
        options: [
          '$wpdb->prepare()',
          'addslashes()',
          'htmlspecialchars()',
          'rawurlencode()',
        ],
        correctAnswer: '$wpdb->prepare()',
        explanation: '$wpdb->prepare() ensures safe placeholders are escaped according to SQL specifications.',
      },
      {
        id: 'wp_q3',
        question: 'What is the recommended practice for managing structured error metadata in enterprise REST controllers?',
        options: [
          'Structured AppError envelope with status code and deterministic error key',
          'Throwing raw generic RuntimeException without headers',
          'Echoing a raw JSON string and calling exit',
          'Returning a silent boolean false',
        ],
        correctAnswer: 'Structured AppError envelope with status code and deterministic error key',
        explanation: 'Structured error envelopes guarantee predictable API response contracts across mobile and web clients.',
      },
    ],
  },
  {
    id: 'backend-systems-engineer',
    title: 'Backend Systems Engineer (Go & SQLite / Cloud)',
    department: 'Platform Engineering',
    type: 'Full-Time',
    description: 'Design and operate distributed services, split SQLite architectures, high-throughput APIs, and concurrency pipelines.',
    durationMinutes: 30,
    firstPhaseQuestion: {
      question: 'Which database design pattern isolates tenant workloads while keeping schema queries lean and scalable?',
      hint: 'Think about local single-file SQLite databases where each project has its own dedicated database file.',
      briefingNotes: [
        'Root metadata coordination with isolated project tenant stores (root.db + project_<id>.db).',
        'Write-Ahead Logging (WAL) concurrency and zero-lock contention across concurrent candidate exam runs.',
      ],
      options: [
        { val: 'split-sqlite', label: 'Split SQLite (root.db + project_<id>.db in WAL mode)' },
        { val: 'monolithic-csv', label: 'Monolithic Unindexed CSV Flat File' },
        { val: 'shared-table', label: 'Single giant table without index partitioning or sharding' },
      ],
      correctAnswer: 'split-sqlite',
    },
    secondPhaseQuestions: [
      {
        id: 'be_q1',
        question: 'What is the primary operational advantage of SQLite Write-Ahead Logging (WAL) mode?',
        options: [
          'Allows concurrent readers to proceed uninterrupted while a single writer commits transactions',
          'Stores all tables as uncompressed plain-text files on disk',
          'Eliminates the need for filesystem write permissions',
          'Automatically replicates database files to external FTP servers',
        ],
        correctAnswer: 'Allows concurrent readers to proceed uninterrupted while a single writer commits transactions',
        explanation: 'WAL mode isolates readers from writer locks, dramatically improving multi-process web throughput.',
      },
      {
        id: 'be_q2',
        question: 'In Go services, why is returning structured *appfault.AppError preferred over bare error primitives?',
        options: [
          'It preserves machine-readable error codes, HTTP status mappings, and caller provenance',
          'It bypasses Go compiler type checking',
          'It prevents goroutines from garbage collection',
          'It converts all errors into fatal runtime panics',
        ],
        correctAnswer: 'It preserves machine-readable error codes, HTTP status mappings, and caller provenance',
        explanation: 'Structured AppError envelopes eliminate ambiguous string errors and provide uniform telemetry.',
      },
      {
        id: 'be_q3',
        question: 'How should positive boolean conditions be evaluated according to strict clean-code guidelines?',
        options: [
          'Implicit check: if isReady { ... }',
          'Explicit comparison: if isReady is compared directly to a boolean literal',
          'Double negation check: if !!isReady { ... }',
          'Ternary boolean coercion: if isReady ? 1 : 0 { ... }',
        ],
        correctAnswer: 'Implicit check: if isReady { ... }',
        explanation: 'Implicit evaluation is clean, concise, and avoids redundant boolean comparisons.',
      },
    ],
  },
  {
    id: 'intern-programmer',
    title: 'Intern Programmer',
    department: 'Engineering',
    type: 'Internship',
    description: 'Learn modern web engineering practices, build core features, and collaborate on testing and documentation.',
    durationMinutes: 30,
    firstPhaseQuestion: {
      question: 'What is the average time complexity of looking up a value by key in a Hash Map / Hash Table?',
      hint: 'Hash functions compute an array index directly from the key in constant time.',
      briefingNotes: [
        'Fundamental algorithm analysis and Big-O notation.',
        'Data structure selection based on read and write performance characteristics.',
      ],
      options: [
        { val: 'O(1)', label: 'O(1) - Constant time on average' },
        { val: 'O(n)', label: 'O(n) - Linear scan of all elements' },
        { val: 'O(log n)', label: 'O(log n) - Logarithmic tree search' },
        { val: 'O(n^2)', label: 'O(n²) - Quadratic nested traversal' },
      ],
      correctAnswer: 'O(1)',
    },
    secondPhaseQuestions: [
      {
        id: 'intern_q1',
        question: 'In modern version control with Git, what is the role of the staging area (git add)?',
        options: [
          'Allows developers to review and selectively prepare atomic changes before creating a commit',
          'Permanently deletes modified files from disk',
          'Uploads files directly to the production web server',
          'Compresses the repository into a zip archive',
        ],
        correctAnswer: 'Allows developers to review and selectively prepare atomic changes before creating a commit',
        explanation: 'Staging lets you organize your changes into precise, cohesive atomic commits.',
      },
      {
        id: 'intern_q2',
        question: 'Which software development principle advocates for extracting repeated logic into reusable functions?',
        options: [
          'DRY (Don’t Repeat Yourself)',
          'YAGNI (You Aren’t Gonna Need It)',
          'KISS (Keep It Simple, Stupid)',
          'WET (Write Everything Twice)',
        ],
        correctAnswer: 'DRY (Don’t Repeat Yourself)',
        explanation: 'DRY reduces code duplication, simplifying maintenance and preventing inconsistent bug fixes.',
      },
      {
        id: 'intern_q3',
        question: 'Why is it important to write automated unit tests for software applications?',
        options: [
          'To verify that individual functions behave correctly and catch regressions early',
          'To replace the need for writing source code',
          'To increase the file size of the deployment repository',
          'To make programs run faster on the operating system',
        ],
        correctAnswer: 'To verify that individual functions behave correctly and catch regressions early',
        explanation: 'Automated tests catch regressions before code hits production, maintaining long-term stability.',
      },
    ],
  },
  {
    id: 'junior-software-engineer',
    title: 'Junior Software Engineer',
    department: 'Engineering',
    type: 'Full-Time',
    description: 'Develop and maintain web services, participate in code reviews, and write unit and integration tests.',
    durationMinutes: 30,
    firstPhaseQuestion: {
      question: 'Which HTTP status code signifies that a client request lacks valid authentication credentials?',
      hint: 'The standard status code indicating unauthenticated access.',
      briefingNotes: [
        'REST API standards and HTTP status code conventions.',
        'Authentication and identity verification patterns.',
      ],
      options: [
        { val: '401', label: '401 Unauthorized (Missing or invalid authentication credentials)' },
        { val: '403', label: '403 Forbidden (Authenticated, but lacking permission for the resource)' },
        { val: '404', label: '404 Not Found (Requested resource does not exist)' },
        { val: '500', label: '500 Internal Server Error (Server encountered an unexpected condition)' },
      ],
      correctAnswer: '401',
    },
    secondPhaseQuestions: [
      {
        id: 'jr_q1',
        question: 'What is the primary difference between synchronous and asynchronous code execution?',
        options: [
          'Asynchronous execution allows the program to continue other tasks while waiting for I/O operations',
          'Synchronous code can only execute inside a web browser',
          'Asynchronous code runs without a CPU',
          'Synchronous code cannot use variables',
        ],
        correctAnswer: 'Asynchronous execution allows the program to continue other tasks while waiting for I/O operations',
        explanation: 'Asynchronous I/O avoids blocking the event loop or thread while waiting for network/disk operations.',
      },
      {
        id: 'jr_q2',
        question: 'Why should unit tests avoid executing unmocked external network requests?',
        options: [
          'External requests make tests slow, non-deterministic, and dependent on network availability',
          'Operating systems forbid unit tests from using sockets',
          'Network calls automatically delete test databases',
          'Unit tests only support CSS files',
        ],
        correctAnswer: 'External requests make tests slow, non-deterministic, and dependent on network availability',
        explanation: 'Mocking isolates the unit under test so execution is fast, repeatable, and deterministic.',
      },
      {
        id: 'jr_q3',
        question: 'According to clean code standards, how should boolean variables be named?',
        options: [
          'With positive affirmative prefixes like is or has (e.g., isReady, hasAccess)',
          'With negative prefixes like isNotReady or hasNoAccess',
          'As single-letter variables like b or z',
          'With numerical suffixes like flag1 and flag2',
        ],
        correctAnswer: 'With positive affirmative prefixes like is or has (e.g., isReady, hasAccess)',
        explanation: 'Positive prefixes (is, has) make logic intuitive and prevent confusing double negatives.',
      },
    ],
  },
  {
    id: 'full-stack-architect',
    title: 'Full-Stack Web Architect (React & Go)',
    department: 'Engineering Leadership',
    type: 'Full-Time',
    description: 'Lead technical architecture, system design, split database topologies, and full-stack performance optimization.',
    durationMinutes: 30,
    firstPhaseQuestion: {
      question: 'In modern full-stack web architectures, what is the best strategy for client-side server state management?',
      hint: 'Think of stale-while-revalidate caching and declarative query invalidation.',
      briefingNotes: [
        'Server state management using libraries like TanStack Query.',
        'Eliminating unnecessary polling and manual fetch cascades.',
      ],
      options: [
        { val: 'stale-while-revalidate', label: 'Stale-While-Revalidate caching with key-based query invalidation' },
        { val: 'infinite-polling', label: 'Continuous unindexed polling every 200 milliseconds' },
        { val: 'hard-refresh', label: 'Calling window.location.reload() after every mutation' },
        { val: 'local-only', label: 'Storing all database tables directly in browser LocalStorage' },
      ],
      correctAnswer: 'stale-while-revalidate',
    },
    secondPhaseQuestions: [
      {
        id: 'arch_q1',
        question: 'In Go microservices, what is the canonical way to handle incoming HTTP request cancellation or timeout?',
        options: [
          'Pass context.Context through all database and downstream calls and listen for ctx.Done()',
          'Kill the entire operating system process immediately',
          'Ignore the cancellation and complete all background work regardless',
          'Set a global boolean variable in the main package',
        ],
        correctAnswer: 'Pass context.Context through all database and downstream calls and listen for ctx.Done()',
        explanation: 'Propagating context.Context prevents wasted CPU and database resources on abandoned client requests.',
      },
      {
        id: 'arch_q2',
        question: 'What is the primary role of a Reverse Proxy (e.g., Caddy or Nginx) in front of modern web services?',
        options: [
          'TLS termination, path routing, rate limiting, and request load balancing',
          'Executing database migrations on every HTTP GET request',
          'Compiling TypeScript code in real-time for each user',
          'Generating automated unit test coverage reports',
        ],
        correctAnswer: 'TLS termination, path routing, rate limiting, and request load balancing',
        explanation: 'A reverse proxy shields application backends and handles transport security and caching.',
      },
      {
        id: 'arch_q3',
        question: 'Why should micro-frontends and decoupled architectures favor strongly-typed API response envelopes?',
        options: [
          'They provide deterministic contracts for success and failure across polyglot stacks',
          'They eliminate the need for HTTP status codes entirely',
          'They enforce CSS styling from the server side',
          'They prevent the browser from caching static assets',
        ],
        correctAnswer: 'They provide deterministic contracts for success and failure across polyglot stacks',
        explanation: 'Predictable envelopes ({ success, data, error }) allow shared SDKs to safely deserialize responses.',
      },
    ],
  },
  {
    id: 'devops-cloud-engineer',
    title: 'DevOps & Cloud Infrastructure Engineer',
    department: 'Operations',
    type: 'Full-Time',
    description: 'Maintain CI/CD pipelines, container orchestration, zero-storage workflows, and cloud infrastructure.',
    durationMinutes: 30,
    firstPhaseQuestion: {
      question: 'What is the primary architectural benefit of multi-stage Docker builds?',
      hint: 'Separating build tools from runtime assets produces lean, hardened production images.',
      briefingNotes: [
        'Container security and attack surface reduction.',
        'Minimizing image size to speed up registry pushes and deployments.',
      ],
      options: [
        { val: 'multi-stage-slimming', label: 'Separates heavy build dependencies to yield tiny, secure runtime images' },
        { val: 'single-fat-container', label: 'Keeps all compilers, header files, and debug tools in the production image' },
        { val: 'manual-zip', label: 'Replaces containerization with manual zip file extraction' },
        { val: 'no-caching', label: 'Disables all filesystem caching across CI pipeline steps' },
      ],
      correctAnswer: 'multi-stage-slimming',
    },
    secondPhaseQuestions: [
      {
        id: 'devops_q1',
        question: 'What is the core principle of a Zero-Storage CI/CD policy for GitHub Actions?',
        options: [
          'Writing test and lint summaries directly to stdout or $GITHUB_STEP_SUMMARY instead of uploading quota-consuming artifact zips',
          'Disabling all automated unit tests across pull requests',
          'Deleting the Git commit history after every build',
          'Storing build logs exclusively on developer workstations',
        ],
        correctAnswer: 'Writing test and lint summaries directly to stdout or $GITHUB_STEP_SUMMARY instead of uploading quota-consuming artifact zips',
        explanation: 'Zero-storage practices prevent free-tier storage exhaustion while preserving rich Markdown summaries.',
      },
      {
        id: 'devops_q2',
        question: 'Why is Infrastructure as Code (IaC) preferred over manual cloud console configuration?',
        options: [
          'Provides version-controlled, reproducible, and auditable infrastructure definitions',
          'Prevents cloud providers from charging for compute resources',
          'Eliminates the need for networking protocols like DNS and IP',
          'Automatically writes application business logic',
        ],
        correctAnswer: 'Provides version-controlled, reproducible, and auditable infrastructure definitions',
        explanation: 'IaC allows teams to track infrastructure changes in Git, detect drift, and provision identical environments.',
      },
      {
        id: 'devops_q3',
        question: 'Why should secret keys, certificates, and passwords never be baked into container image layers?',
        options: [
          'Image layers are permanently cached and inspectable, creating severe credential leaks',
          'Containers cannot execute if an environment variable exists',
          'Docker daemon automatically deletes images that contain tokens',
          'Secret strings cause memory leaks in Linux cgroups',
        ],
        correctAnswer: 'Image layers are permanently cached and inspectable, creating severe credential leaks',
        explanation: 'Secrets must be injected dynamically at runtime via secrets managers or environment variables.',
      },
    ],
  },
];

const STORAGE_KEY = 'wp_exam_custom_job_roles';

export function getCustomJobRoles(): JobRole[] {
  const isWindowDefined = (typeof window !== 'undefined');

  if (!isWindowDefined) {
    return [];
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const hasRaw = Boolean(raw);

    if (hasRaw) {
      const parsed = JSON.parse(raw as string);
      const isArr = Array.isArray(parsed);

      if (isArr) {
        return parsed;
      }
    }
  } catch {
    // Ignore parse error
  }

  return [];
}

/**
 * Synchronizes custom job roles from the SQLite database server to local storage cache.
 */
export async function syncJobRolesFromServer(): Promise<JobRole[]> {
  const isWindowDefined = (typeof window !== 'undefined');

  if (!isWindowDefined) {
    return SEEDED_JOB_ROLES;
  }

  try {
    const res = await unifiedFetch('/api/v1/applicants/roles', '/wp-json/wp-exam/v1/applicants/roles');
    const isSuccess = res.ok;

    if (isSuccess) {
      const json = await res.json();
      const serverRoles = json?.data?.roles ?? json?.roles ?? [];
      const isRolesArray = Array.isArray(serverRoles);

      if (isRolesArray) {
        const customOnly = serverRoles.filter((r: JobRole) => Boolean(r && r.id));
        const hasCustom = (customOnly.length > 0);

        if (hasCustom) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(customOnly));
          window.dispatchEvent(new Event('wp_exam_roles_updated'));
        }
      }
    }
  } catch (err) {
    console.warn('Non-blocking: could not fetch job roles from server:', err);
  }

  return getJobRoles();
}

/**
 * Persists a job role to both local cache and SQLite backend.
 */
export async function persistJobRoleToServer(role: JobRole): Promise<void> {
  saveJobRole(role);

  try {
    const customList = getCustomJobRoles();

    await unifiedFetch('/api/v1/applicants/roles', '/wp-json/wp-exam/v1/applicants/roles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roles: customList }),
    });
  } catch (err) {
    console.error('Failed to sync job role to server:', err);
  }
}

/**
 * Deletes a job role from both local cache and SQLite backend.
 */
export async function deleteJobRoleFromServer(roleId: string): Promise<void> {
  deleteJobRole(roleId);

  try {
    const customList = getCustomJobRoles();

    await unifiedFetch('/api/v1/applicants/roles', '/wp-json/wp-exam/v1/applicants/roles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roles: customList }),
    });
  } catch (err) {
    console.error('Failed to sync job role deletion to server:', err);
  }
}

/**
 * Returns all active job roles, merging default seeded roles with any admin-created custom roles.
 */
export function getJobRoles(): JobRole[] {
  if (typeof window === 'undefined') {
    return SEEDED_JOB_ROLES;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const hasRaw = Boolean(raw);

    if (hasRaw) {
      const customRoles: JobRole[] = JSON.parse(raw as string);
      const isCustomArray = Array.isArray(customRoles);

      if (isCustomArray) {
        // Merge: keep default roles and append custom roles (or replace if matching id)
        const customIds = new Set(customRoles.map((r) => r.id));
        const filteredSeeded = SEEDED_JOB_ROLES.filter((r) => !customIds.has(r.id));

        return [...filteredSeeded, ...customRoles];
      }
    }
  } catch (err) {
    console.warn('Failed to load custom job roles from storage:', err);
  }

  return SEEDED_JOB_ROLES;
}

/**
 * Looks up a job role by id, falling back to the first available role if not found.
 */
export function getJobRoleById(roleId?: string): JobRole {
  const roles = getJobRoles();
  const hasRoleId = Boolean(roleId);

  if (hasRoleId) {
    const matched = roles.find((r) => r.id === roleId);
    const hasMatched = Boolean(matched);

    if (hasMatched) {
      return matched as JobRole;
    }
  }

  return roles[0];
}

/**
 * Persists a new or updated job role to local storage.
 */
export function saveJobRole(role: JobRole): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const existingRaw = localStorage.getItem(STORAGE_KEY);
    let customList: JobRole[] = [];

    const hasExisting = Boolean(existingRaw);

    if (hasExisting) {
      const parsed = JSON.parse(existingRaw as string);
      const isParsedArray = Array.isArray(parsed);

      if (isParsedArray) {
        customList = parsed;
      }
    }

    const existingIndex = customList.findIndex((r) => r.id === role.id);
    const isExisting = (existingIndex >= 0);

    if (isExisting) {
      customList[existingIndex] = { ...role, isCustom: true };
    } else {
      customList.push({ ...role, isCustom: true });
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(customList));
    window.dispatchEvent(new Event('wp_exam_roles_updated'));
  } catch (err) {
    console.error('Failed to save job role to storage:', err);
  }
}

/**
 * Deletes a custom job role by id.
 */
export function deleteJobRole(roleId: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const existingRaw = localStorage.getItem(STORAGE_KEY);
    const hasExisting = Boolean(existingRaw);

    if (hasExisting) {
      const parsed: JobRole[] = JSON.parse(existingRaw as string);
      const isParsedArray = Array.isArray(parsed);

      if (isParsedArray) {
        const filtered = parsed.filter((r) => r.id !== roleId);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
        window.dispatchEvent(new Event('wp_exam_roles_updated'));
      }
    }
  } catch (err) {
    console.error('Failed to delete job role from storage:', err);
  }
}
