/**
 * Email Notification Template Engine
 * Canonical sanitized HTML template, multi-theme palettes, and modular section generator.
 */

import {
  EmailThemeType,
  EmailSectionVisibility,
  EmailCustomizationConfig,
} from '@/lib/types/form';

export interface EmailThemePalette {
  id: EmailThemeType;
  name: string;
  primaryColor: string;
  headerBg: string;
  headerTextColor: string;
  badgeBg: string;
  badgeTextColor: string;
  borderAccent: string;
}

export const EMAIL_THEMES: Record<EmailThemeType, EmailThemePalette> = {
  emerald: {
    id: 'emerald',
    name: 'Emerald Choice',
    primaryColor: '#16a34a',
    headerBg: '#0f392b',
    headerTextColor: '#ffffff',
    badgeBg: '#dcfce7',
    badgeTextColor: '#166534',
    borderAccent: '#bbf7d0',
  },
  navy: {
    id: 'navy',
    name: 'Executive Navy',
    primaryColor: '#0b1220',
    headerBg: '#0f172a',
    headerTextColor: '#ffffff',
    badgeBg: '#f1f5f9',
    badgeTextColor: '#0f172a',
    borderAccent: '#e2e8f0',
  },
  blue: {
    id: 'blue',
    name: 'Royal Modern Blue',
    primaryColor: '#2563eb',
    headerBg: '#1e3a8a',
    headerTextColor: '#ffffff',
    badgeBg: '#dbeafe',
    badgeTextColor: '#1e40af',
    borderAccent: '#bfdbfe',
  },
  purple: {
    id: 'purple',
    name: 'Letterly Purple',
    primaryColor: '#7c3aed',
    headerBg: '#3b0764',
    headerTextColor: '#ffffff',
    badgeBg: '#f3e8ff',
    badgeTextColor: '#6b21a8',
    borderAccent: '#e9d5ff',
  },
  amber: {
    id: 'amber',
    name: 'Warm Sunset Amber',
    primaryColor: '#ea580c',
    headerBg: '#431407',
    headerTextColor: '#ffffff',
    badgeBg: '#ffedd5',
    badgeTextColor: '#9a3412',
    borderAccent: '#fed7aa',
  },
  slate: {
    id: 'slate',
    name: 'Corporate Slate',
    primaryColor: '#475569',
    headerBg: '#1e293b',
    headerTextColor: '#ffffff',
    badgeBg: '#f1f5f9',
    badgeTextColor: '#334155',
    borderAccent: '#e2e8f0',
  },
};

export const DEFAULT_EMAIL_SECTIONS: EmailSectionVisibility = {
  showApplicantDetails: true,
  showProfilesAndLinks: true,
  showQualifications: true,
  showTechnicalStatement: true,
  showCompensation: true,
};

export const DEFAULT_MOCK_APPLICANT_DATA: Record<string, string | number> = {
  company_name: 'WP Exam Systems',
  form_title: 'Full Stack Engineering Evaluation',
  job_position: 'Senior Full Stack Developer',
  candidate_name: 'Alex Morgan',
  candidate_email: 'alex.morgan@example.org',
  candidate_phone: '+1 (555) 019-2834',
  candidate_country: 'United States',
  experience_years: '5+',
  languages_known: 'TypeScript, React, Python, Go, Tailwind CSS',
  open_to_work: 'Yes, Immediate',
  github_url: 'https://github.com/alex-morgan-sample',
  linkedin_url: 'https://linkedin.com/in/alex-morgan-sample',
  portfolio_url: 'https://alex-morgan-sample.example.com',
  cv_drive_url: 'https://drive.google.com/file/d/sample-resume-id/view',
  degree_info: 'B.S. in Computer Science',
  remote_compatible: 'Yes, Dedicated Home Office',
  workstation_specs: 'Core i7, 32GB RAM, Dual 4K Displays, 1Gbps Fiber',
  seniority_level: 'Senior Specialist (5+ Years)',
  ai_statement:
    'Proficient in designing decoupled reactive architectures, implementing monadic error envelopes, and orchestrating automated test suites with zero regressions.',
  candidate_intro:
    'Passionate full stack software engineer dedicated to building performant web applications with obsessive attention to user experience, accessibility, and high contrast design.',
  current_salary: '$5,000 / month',
  asking_salary: '$6,500 / month',
  min_salary: '$6,000',
  max_salary: '$7,500',
  full_time_commitment: 'Yes (40-45 hrs/week)',
  primary_color: '#16a34a',
};

/**
 * Builds modular HTML email using customizable sections, theme palette, and variable values.
 */
export function generateModularEmailHtml(
  customization?: Partial<EmailCustomizationConfig>,
  userVariables?: Record<string, string | number>
): string {
  const themeKey = customization?.theme || 'emerald';
  const themePalette = EMAIL_THEMES[themeKey] || EMAIL_THEMES.emerald;
  const primaryColor = customization?.primaryColor || themePalette.primaryColor;
  const headerBg = themePalette.headerBg;

  const sections: EmailSectionVisibility = {
    ...DEFAULT_EMAIL_SECTIONS,
    ...(customization?.sections || {}),
  };

  const vars: Record<string, string | number> = {
    ...DEFAULT_MOCK_APPLICANT_DATA,
    company_name: customization?.companyName || 'WP Exam Systems',
    ...(userVariables || {}),
  };

  const companyName = String(vars.company_name || 'WP Exam Systems');
  const formTitle = String(vars.form_title || 'Assessment');
  const jobPosition = String(vars.job_position || 'Technical Candidate');
  const candidateName = String(vars.candidate_name || 'Applicant');
  const candidateEmail = String(vars.candidate_email || 'candidate@example.org');
  const candidatePhone = String(vars.candidate_phone || '+1 (555) 019-2834');
  const candidateCountry = String(vars.candidate_country || 'United States');

  const bannerText =
    customization?.headerBannerText || `${companyName} — Assessment Submission`;
  const footerNote =
    customization?.footerNoteText ||
    'Submission captured securely by WP Exam Application Engine.';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assessment Submission - ${candidateName}</title>
</head>
<body style="margin: 0; padding: 0; background: #f6f7fb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" border="0" width="100%" cellspacing="0" cellpadding="0" style="background: #f6f7fb;">
    <tbody>
      <tr>
        <td align="center" style="padding: 24px 12px;">
          <table role="presentation" border="0" width="100%" cellspacing="0" cellpadding="0" style="width: 100%; max-width: 680px; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #eceef5; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);">
            <tbody>
              <!-- Header Banner -->
              <tr>
                <td style="padding: 24px 26px; background: ${headerBg}; border-bottom: 4px solid ${primaryColor};">
                  <div style="font-family: inherit; font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(255, 255, 255, 0.75); font-weight: 600;">
                    ${bannerText}
                  </div>
                  <div style="font-family: inherit; font-size: 20px; line-height: 28px; color: #ffffff; font-weight: bold; margin-top: 8px;">
                    ${formTitle} &bull; ${jobPosition} &bull; ${candidateName}
                  </div>
                  <div style="font-family: inherit; font-size: 13px; line-height: 20px; color: rgba(255, 255, 255, 0.85); margin-top: 10px;">
                    Email: <a href="mailto:${candidateEmail}" style="color: #ffffff; text-decoration: underline;">${candidateEmail}</a>
                    &nbsp;&nbsp;&bull;&nbsp;&nbsp;
                    Phone: <span style="color: #ffffff;">${candidatePhone}</span>
                    &nbsp;&nbsp;&bull;&nbsp;&nbsp;
                    Country: <span style="color: #ffffff;">${candidateCountry}</span>
                  </div>
                </td>
              </tr>

              <!-- Content Body -->
              <tr>
                <td style="padding: 20px 24px 16px 24px;">

                  ${
                    sections.showApplicantDetails
                      ? `<!-- Section 1: Applicant & Role -->
                  <table role="presentation" border="0" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 14px;">
                    <tbody>
                      <tr>
                        <td style="padding: 10px; background: #f6f7fb; border-radius: 14px;">
                          <table role="presentation" border="0" width="100%" cellspacing="0" cellpadding="0" style="border: 1px solid #eceef5; border-radius: 12px; background: #ffffff; overflow: hidden;">
                            <tbody>
                              <tr>
                                <td style="padding: 12px 16px; background: #fbfbfe; border-bottom: 1px solid #eceef5;">
                                  <div style="font-family: inherit; font-size: 13px; color: #0b1220; font-weight: bold; display: flex; align-items: center; gap: 8px;">
                                    <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: ${primaryColor};"></span>
                                    Section 1 — Applicant &amp; Role Details
                                  </div>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 10px 14px;">
                                  <table role="presentation" border="0" width="100%" cellspacing="0" cellpadding="0" style="border: 1px solid #eceef5; border-radius: 10px; overflow: hidden; background: #ffffff;">
                                    <tbody>
                                      <tr>
                                        <td valign="top" width="45%" style="padding: 10px; background: #fbfbfe; border-bottom: 1px solid #eceef5; font-size: 12px; color: #5b647a;">Full Name</td>
                                        <td valign="top" style="padding: 10px; border-bottom: 1px solid #eceef5; font-size: 12px; color: #0b1220; font-weight: 600;">${vars.candidate_name}</td>
                                      </tr>
                                      <tr>
                                        <td valign="top" style="padding: 10px; background: #fbfbfe; border-bottom: 1px solid #eceef5; font-size: 12px; color: #5b647a;">Target Role / Position</td>
                                        <td valign="top" style="padding: 10px; border-bottom: 1px solid #eceef5; font-size: 12px; color: #0b1220; font-weight: 600;">${vars.job_position}</td>
                                      </tr>
                                      <tr>
                                        <td valign="top" style="padding: 10px; background: #fbfbfe; border-bottom: 1px solid #eceef5; font-size: 12px; color: #5b647a;">Open to Work Immediately?</td>
                                        <td valign="top" style="padding: 10px; border-bottom: 1px solid #eceef5; font-size: 12px; color: #0b1220;">${vars.open_to_work}</td>
                                      </tr>
                                      <tr>
                                        <td valign="top" style="padding: 10px; background: #fbfbfe; border-bottom: 1px solid #eceef5; font-size: 12px; color: #5b647a;">Years of Relevant Experience</td>
                                        <td valign="top" style="padding: 10px; border-bottom: 1px solid #eceef5; font-size: 12px; color: #0b1220;">${vars.experience_years}</td>
                                      </tr>
                                      <tr>
                                        <td valign="top" style="padding: 10px; background: #fbfbfe; font-size: 12px; color: #5b647a;">Core Technologies</td>
                                        <td valign="top" style="padding: 10px; font-size: 12px; color: #0b1220;">${vars.languages_known}</td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    </tbody>
                  </table>`
                      : ''
                  }

                  ${
                    sections.showProfilesAndLinks
                      ? `<!-- Section 2: Portfolio & Online Profiles -->
                  <table role="presentation" border="0" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 14px;">
                    <tbody>
                      <tr>
                        <td style="padding: 10px; background: #f6f7fb; border-radius: 14px;">
                          <table role="presentation" border="0" width="100%" cellspacing="0" cellpadding="0" style="border: 1px solid #eceef5; border-radius: 12px; background: #ffffff; overflow: hidden;">
                            <tbody>
                              <tr>
                                <td style="padding: 12px 16px; background: #fbfbfe; border-bottom: 1px solid #eceef5;">
                                  <div style="font-family: inherit; font-size: 13px; color: #0b1220; font-weight: bold; display: flex; align-items: center; gap: 8px;">
                                    <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: ${primaryColor};"></span>
                                    Section 2 — Portfolio &amp; Online Profiles
                                  </div>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 10px 14px;">
                                  <table role="presentation" border="0" width="100%" cellspacing="0" cellpadding="0" style="border: 1px solid #eceef5; border-radius: 10px; overflow: hidden; background: #ffffff;">
                                    <tbody>
                                      <tr>
                                        <td valign="top" width="45%" style="padding: 10px; background: #fbfbfe; border-bottom: 1px solid #eceef5; font-size: 12px; color: #5b647a;">GitHub Profile</td>
                                        <td valign="top" style="padding: 10px; border-bottom: 1px solid #eceef5; font-size: 12px; color: #0b1220;">
                                          <a href="${vars.github_url}" target="_blank" style="color: ${primaryColor}; text-decoration: underline;">${vars.github_url}</a>
                                        </td>
                                      </tr>
                                      <tr>
                                        <td valign="top" style="padding: 10px; background: #fbfbfe; border-bottom: 1px solid #eceef5; font-size: 12px; color: #5b647a;">LinkedIn Profile</td>
                                        <td valign="top" style="padding: 10px; border-bottom: 1px solid #eceef5; font-size: 12px; color: #0b1220;">
                                          <a href="${vars.linkedin_url}" target="_blank" style="color: ${primaryColor}; text-decoration: underline;">${vars.linkedin_url}</a>
                                        </td>
                                      </tr>
                                      <tr>
                                        <td valign="top" style="padding: 10px; background: #fbfbfe; font-size: 12px; color: #5b647a;">CV / Resume Link</td>
                                        <td valign="top" style="padding: 10px; font-size: 12px; color: #0b1220;">
                                          <a href="${vars.cv_drive_url}" target="_blank" style="color: ${primaryColor}; text-decoration: underline;">View Candidate Resume</a>
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    </tbody>
                  </table>`
                      : ''
                  }

                  ${
                    sections.showQualifications
                      ? `<!-- Section 3: Qualifications & Workstation -->
                  <table role="presentation" border="0" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 14px;">
                    <tbody>
                      <tr>
                        <td style="padding: 10px; background: #f6f7fb; border-radius: 14px;">
                          <table role="presentation" border="0" width="100%" cellspacing="0" cellpadding="0" style="border: 1px solid #eceef5; border-radius: 12px; background: #ffffff; overflow: hidden;">
                            <tbody>
                              <tr>
                                <td style="padding: 12px 16px; background: #fbfbfe; border-bottom: 1px solid #eceef5;">
                                  <div style="font-family: inherit; font-size: 13px; color: #0b1220; font-weight: bold; display: flex; align-items: center; gap: 8px;">
                                    <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: ${primaryColor};"></span>
                                    Section 3 — Qualifications &amp; Workstation
                                  </div>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 10px 14px;">
                                  <table role="presentation" border="0" width="100%" cellspacing="0" cellpadding="0" style="border: 1px solid #eceef5; border-radius: 10px; overflow: hidden; background: #ffffff;">
                                    <tbody>
                                      <tr>
                                        <td valign="top" width="45%" style="padding: 10px; background: #fbfbfe; border-bottom: 1px solid #eceef5; font-size: 12px; color: #5b647a;">Degree / Academic</td>
                                        <td valign="top" style="padding: 10px; border-bottom: 1px solid #eceef5; font-size: 12px; color: #0b1220;">${vars.degree_info}</td>
                                      </tr>
                                      <tr>
                                        <td valign="top" style="padding: 10px; background: #fbfbfe; border-bottom: 1px solid #eceef5; font-size: 12px; color: #5b647a;">Remote Compatible?</td>
                                        <td valign="top" style="padding: 10px; border-bottom: 1px solid #eceef5; font-size: 12px; color: #0b1220;">${vars.remote_compatible}</td>
                                      </tr>
                                      <tr>
                                        <td valign="top" style="padding: 10px; background: #fbfbfe; font-size: 12px; color: #5b647a;">Hardware Specs</td>
                                        <td valign="top" style="padding: 10px; font-size: 12px; color: #0b1220;">${vars.workstation_specs}</td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    </tbody>
                  </table>`
                      : ''
                  }

                  ${
                    sections.showTechnicalStatement
                      ? `<!-- Section 4: Technical Statement & Self Introduction -->
                  <table role="presentation" border="0" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 14px;">
                    <tbody>
                      <tr>
                        <td style="padding: 10px; background: #f6f7fb; border-radius: 14px;">
                          <table role="presentation" border="0" width="100%" cellspacing="0" cellpadding="0" style="border: 1px solid #eceef5; border-radius: 12px; background: #ffffff; overflow: hidden;">
                            <tbody>
                              <tr>
                                <td style="padding: 12px 16px; background: #fbfbfe; border-bottom: 1px solid #eceef5;">
                                  <div style="font-family: inherit; font-size: 13px; color: #0b1220; font-weight: bold; display: flex; align-items: center; gap: 8px;">
                                    <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: ${primaryColor};"></span>
                                    Section 4 — Technical Statement &amp; Introduction
                                  </div>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 10px 14px;">
                                  <div style="padding: 10px; border: 1px solid #eceef5; border-radius: 10px; background: #ffffff; margin-bottom: 8px;">
                                    <div style="font-size: 11px; color: #5b647a; margin-bottom: 4px; font-weight: 600;">Technical Approach</div>
                                    <div style="font-size: 12px; line-height: 18px; color: #0b1220;">${vars.ai_statement}</div>
                                  </div>
                                  <div style="padding: 10px; border: 1px solid #eceef5; border-radius: 10px; background: #ffffff;">
                                    <div style="font-size: 11px; color: #5b647a; margin-bottom: 4px; font-weight: 600;">Candidate Introduction</div>
                                    <div style="font-size: 12px; line-height: 18px; color: #0b1220;">${vars.candidate_intro}</div>
                                  </div>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    </tbody>
                  </table>`
                      : ''
                  }

                  ${
                    sections.showCompensation
                      ? `<!-- Section 5: Compensation & Availability -->
                  <table role="presentation" border="0" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 14px;">
                    <tbody>
                      <tr>
                        <td style="padding: 10px; background: #f6f7fb; border-radius: 14px;">
                          <table role="presentation" border="0" width="100%" cellspacing="0" cellpadding="0" style="border: 1px solid #eceef5; border-radius: 12px; background: #ffffff; overflow: hidden;">
                            <tbody>
                              <tr>
                                <td style="padding: 12px 16px; background: #fbfbfe; border-bottom: 1px solid #eceef5;">
                                  <div style="font-family: inherit; font-size: 13px; color: #0b1220; font-weight: bold; display: flex; align-items: center; gap: 8px;">
                                    <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: ${primaryColor};"></span>
                                    Section 5 — Compensation &amp; Availability
                                  </div>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 10px 14px;">
                                  <table role="presentation" border="0" width="100%" cellspacing="0" cellpadding="0" style="border: 1px solid #eceef5; border-radius: 10px; overflow: hidden; background: #ffffff;">
                                    <tbody>
                                      <tr>
                                        <td valign="top" width="45%" style="padding: 10px; background: #fbfbfe; border-bottom: 1px solid #eceef5; font-size: 12px; color: #5b647a;">Current Compensation</td>
                                        <td valign="top" style="padding: 10px; border-bottom: 1px solid #eceef5; font-size: 12px; color: #0b1220;">${vars.current_salary}</td>
                                      </tr>
                                      <tr>
                                        <td valign="top" style="padding: 10px; background: #fbfbfe; border-bottom: 1px solid #eceef5; font-size: 12px; color: #5b647a;">Asking Compensation</td>
                                        <td valign="top" style="padding: 10px; border-bottom: 1px solid #eceef5; font-size: 12px; color: #0b1220; font-weight: 600;">${vars.asking_salary}</td>
                                      </tr>
                                      <tr>
                                        <td valign="top" style="padding: 10px; background: #fbfbfe; font-size: 12px; color: #5b647a;">Full-time Commitment?</td>
                                        <td valign="top" style="padding: 10px; font-size: 12px; color: #0b1220;">${vars.full_time_commitment}</td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    </tbody>
                  </table>`
                      : ''
                  }

                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding: 16px 24px; background: #fbfbfe; border-top: 1px solid #eceef5;">
                  <div style="font-family: inherit; font-size: 11px; line-height: 16px; color: #7a849b;">
                    ${footerNote}<br>
                    <span style="color: #a1a9bd;">${companyName} &bull; Automated Candidate Notification Pipeline</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </td>
      </tr>
    </tbody>
  </table>
</body>
</html>`;
}

export const RAW_PLACEHOLDER_VARIABLES: Record<string, string | number> = {
  company_name: '{{company_name}}',
  form_title: '{{form_title}}',
  job_position: '{{job_position}}',
  candidate_name: '{{candidate_name}}',
  candidate_email: '{{candidate_email}}',
  candidate_phone: '{{candidate_phone}}',
  candidate_country: '{{candidate_country}}',
  experience_years: '{{experience_years}}',
  languages_known: '{{languages_known}}',
  open_to_work: '{{open_to_work}}',
  github_url: '{{github_url}}',
  linkedin_url: '{{linkedin_url}}',
  portfolio_url: '{{portfolio_url}}',
  cv_drive_url: '{{cv_drive_url}}',
  degree_info: '{{degree_info}}',
  remote_compatible: '{{remote_compatible}}',
  workstation_specs: '{{workstation_specs}}',
  seniority_level: '{{seniority_level}}',
  ai_statement: '{{ai_statement}}',
  candidate_intro: '{{candidate_intro}}',
  current_salary: '{{current_salary}}',
  asking_salary: '{{asking_salary}}',
  full_time_commitment: '{{full_time_commitment}}',
  primary_color: '{{primary_color}}',
};

export const DEFAULT_EMAIL_TEMPLATE = generateModularEmailHtml(
  { primaryColor: '{{primary_color}}' },
  RAW_PLACEHOLDER_VARIABLES
);

/**
 * Interpolates variables into an email template string.
 * Supports both standard {{variable}} and jinja/django style {{variable|default('val')}}.
 */
export function interpolateEmailTemplate(
  template: string,
  variables: Record<string, string | number>
): string {
  if (!template) {
    return '';
  }

  // Handle {{key|default('...')}} or {{key|default("...")}}
  let result = template.replace(
    /\{\{\s*(\w+)\s*\|\s*default\((['"])(.*?)\2\)\s*\}\}/g,
    (_, key, __, defaultVal) => {
      const val = variables[key];
      if (val !== undefined && val !== null && String(val).trim().length > 0) {
        return String(val);
      }
      return defaultVal;
    }
  );

  // Handle standard {{key}}
  result = result.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key) => {
    const val = variables[key];
    if (val !== undefined && val !== null) {
      return String(val);
    }
    return '';
  });

  return result;
}
