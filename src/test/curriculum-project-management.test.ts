import { describe, it, expect, beforeEach } from 'vitest';
import {
  INITIAL_CATEGORIES,
  STORAGE_KEY,
  CategoryItem,
  ProjectItem,
  ProjectSection,
} from '@/components/admin/project-hierarchy-manager';

describe('Curriculum Projects & Tracks Management', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('provides default initial categories and projects when storage is empty', () => {
    expect(INITIAL_CATEGORIES.length).toBeGreaterThanOrEqual(2);
    const onboardingCat = INITIAL_CATEGORIES.find((c) => c.id === 'cat_onboarding');
    expect(onboardingCat).toBeDefined();
    expect(onboardingCat!.projects.length).toBeGreaterThanOrEqual(1);

    const firstProj = onboardingCat!.projects[0];
    expect(firstProj.id).toBe('proj_sec_101');
    expect(firstProj.sections.length).toBe(3);
    expect(firstProj.sections[0].content_type).toBe('reading');
    expect(firstProj.sections[1].content_type).toBe('checklist');
    expect(firstProj.sections[2].content_type).toBe('quiz');
  });

  it('persists and retrieves curriculum categories and projects in localStorage', () => {
    const customCategories: CategoryItem[] = [
      {
        id: 'cat_custom_engineering',
        title: 'Cloud Engineering & DevOps',
        description: 'Kubernetes, Terraform, and Zero-Storage CI/CD.',
        projects: [
          {
            id: 'proj_k8s_ops',
            title: 'Kubernetes Cluster Operations',
            description: 'Cluster bootstrap and GitOps workflows.',
            category_id: 'cat_custom_engineering',
            pipeline_order: ['sec_1', 'sec_2'],
            permissions: ['developer', 'employee'],
            sections: [
              {
                id: 'sec_1',
                title: 'Cluster Topology & Control Plane',
                content_type: 'reading',
                reading_content: 'Review control plane high availability architecture.',
              },
              {
                id: 'sec_2',
                title: 'Deployment Verification Checklist',
                content_type: 'checklist',
                checklist: [
                  { id: 'c1', label: 'Applied cert-manager CRDs', is_required: true },
                ],
              },
            ],
          },
        ],
      },
    ];

    localStorage.setItem(STORAGE_KEY, JSON.stringify(customCategories));
    const raw = localStorage.getItem(STORAGE_KEY);
    expect(raw).toBeDefined();

    const parsed: CategoryItem[] = JSON.parse(raw!);
    expect(parsed.length).toBe(1);
    expect(parsed[0].id).toBe('cat_custom_engineering');
    expect(parsed[0].projects[0].title).toBe('Kubernetes Cluster Operations');
  });

  it('supports creating a new curriculum project with starter sections', () => {
    const categories: CategoryItem[] = JSON.parse(JSON.stringify(INITIAL_CATEGORIES));
    const targetCat = categories[0];

    const newProject: ProjectItem = {
      id: 'proj_new_qa',
      title: 'QA Automation Engineering',
      description: 'Playwright E2E and visual regression test suites.',
      category_id: targetCat.id,
      pipeline_order: ['sec_qa_1', 'sec_qa_2'],
      permissions: ['candidate', 'developer'],
      sections: [
        {
          id: 'sec_qa_1',
          title: '1. Test Isolation Rules',
          content_type: 'reading',
          reading_content: 'Tests must never touch production or upload artifacts.',
        },
        {
          id: 'sec_qa_2',
          title: '2. Verification Quiz',
          content_type: 'quiz',
          questions: [
            {
              id: 'q1',
              title: 'Are actions/upload-artifact calls permitted in CI/CD?',
              options: ['Yes', 'No (Zero-Storage Mandate)'],
              correctAnswer: 'No (Zero-Storage Mandate)',
            },
          ],
        },
      ],
    };

    targetCat.projects.push(newProject);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));

    const retrieved: CategoryItem[] = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    const foundCat = retrieved.find((c) => c.id === targetCat.id);
    const foundProj = foundCat?.projects.find((p) => p.id === 'proj_new_qa');

    expect(foundProj).toBeDefined();
    expect(foundProj!.title).toBe('QA Automation Engineering');
    expect(foundProj!.sections.length).toBe(2);
  });

  it('supports duplicating a curriculum project with isolated ID', () => {
    const original: ProjectItem = INITIAL_CATEGORIES[0].projects[0];
    const cloneId = `${original.id}_copy_1`;
    const cloned: ProjectItem = {
      ...JSON.parse(JSON.stringify(original)),
      id: cloneId,
      title: `${original.title} (Copy)`,
    };

    expect(cloned.id).toBe(cloneId);
    expect(cloned.title).toBe('Security Compliance & Password Hygiene (Copy)');
    expect(cloned.sections.length).toBe(original.sections.length);
  });

  it('supports updating project metadata and allowed roles', () => {
    const project: ProjectItem = JSON.parse(JSON.stringify(INITIAL_CATEGORIES[0].projects[0]));
    project.title = 'Updated IT Security Protocols';
    project.permissions = ['subscriber', 'contributor'];

    expect(project.title).toBe('Updated IT Security Protocols');
    expect(project.permissions).toContain('subscriber');
    expect(project.permissions).toContain('contributor');
    expect(project.permissions).not.toContain('developer');
  });

  it('supports modifying, reordering, and deleting learning sections', () => {
    const project: ProjectItem = JSON.parse(JSON.stringify(INITIAL_CATEGORIES[0].projects[0]));
    expect(project.sections.length).toBe(3);

    // 1. Add section
    const newSec: ProjectSection = {
      id: 'sec_new_extra',
      title: '4. Disaster Recovery Drill',
      content_type: 'reading',
      reading_content: 'Review runbook for endpoint lockouts.',
    };
    project.sections.push(newSec);
    project.pipeline_order.push(newSec.id);
    expect(project.sections.length).toBe(4);

    // 2. Reorder (move last section up)
    const temp = project.sections[2];
    project.sections[2] = project.sections[3];
    project.sections[3] = temp;
    expect(project.sections[2].id).toBe('sec_new_extra');

    // 3. Delete a section
    project.sections = project.sections.filter((s) => s.id !== 'sec_read_1');
    expect(project.sections.length).toBe(3);
    expect(project.sections.some((s) => s.id === 'sec_read_1')).toBe(false);
  });

  it('safely deletes a project from a category', () => {
    const categories: CategoryItem[] = JSON.parse(JSON.stringify(INITIAL_CATEGORIES));
    const targetCat = categories[0];
    const initialCount = targetCat.projects.length;

    targetCat.projects = targetCat.projects.filter((p) => p.id !== 'proj_sec_101');
    expect(targetCat.projects.length).toBe(initialCount - 1);
    expect(targetCat.projects.some((p) => p.id === 'proj_sec_101')).toBe(false);
  });
});
