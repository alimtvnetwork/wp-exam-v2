/**
 * Email Notification Template Engine
 * Canonical sanitized HTML template and dynamic interpolation utilities.
 */

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

export const DEFAULT_EMAIL_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assessment Submission - {{candidate_name}}</title>
</head>
<body style="margin: 0; padding: 0; background: #f6f7fb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" border="0" width="100%" cellspacing="0" cellpadding="0" style="background: #f6f7fb;">
    <tbody>
      <tr>
        <td align="center" style="padding: 24px 12px;">
          <table role="presentation" border="0" width="680" cellspacing="0" cellpadding="0" style="width: 100%; max-width: 680px; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #eceef5; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);">
            <tbody>
              <!-- Header Banner -->
              <tr>
                <td style="padding: 24px 26px; background: {{primary_color}};">
                  <div style="font-family: inherit; font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(255, 255, 255, 0.75); font-weight: 600;">
                    {{company_name}} — New Submission
                  </div>
                  <div style="font-family: inherit; font-size: 20px; line-height: 28px; color: #ffffff; font-weight: bold; margin-top: 8px;">
                    {{form_title}} - {{job_position}} - {{candidate_name}}
                  </div>
                  <div style="font-family: inherit; font-size: 13px; line-height: 20px; color: rgba(255, 255, 255, 0.85); margin-top: 10px;">
                    Email: <a href="mailto:{{candidate_email}}" style="color: #ffffff; text-decoration: underline;">{{candidate_email}}</a>
                    &nbsp;&nbsp;•&nbsp;&nbsp;
                    Phone: <span style="color: #ffffff;">{{candidate_phone}}</span>
                    &nbsp;&nbsp;•&nbsp;&nbsp;
                    Country: <span style="color: #ffffff;">{{candidate_country}}</span>
                  </div>
                </td>
              </tr>

              <!-- Content Body -->
              <tr>
                <td style="padding: 20px 24px 16px 24px;">
                  <!-- Section 1: Applicant & Role -->
                  <table role="presentation" border="0" width="100%" cellspacing="0" cellpadding="0">
                    <tbody>
                      <tr>
                        <td style="padding: 10px; background: #f6f7fb; border-radius: 14px;">
                          <table role="presentation" border="0" width="100%" cellspacing="0" cellpadding="0" style="border: 1px solid #eceef5; border-radius: 12px; background: #ffffff; overflow: hidden;">
                            <tbody>
                              <tr>
                                <td style="padding: 14px 16px 10px 16px; background: #fbfbfe; border-bottom: 1px solid #eceef5;">
                                  <div style="font-family: inherit; font-size: 13px; color: #0b1220; font-weight: bold;">
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
                                        <td valign="top" style="padding: 10px; border-bottom: 1px solid #eceef5; font-size: 12px; color: #0b1220; font-weight: 600;">{{candidate_name}}</td>
                                      </tr>
                                      <tr>
                                        <td valign="top" style="padding: 10px; background: #fbfbfe; border-bottom: 1px solid #eceef5; font-size: 12px; color: #5b647a;">Target Role / Position</td>
                                        <td valign="top" style="padding: 10px; border-bottom: 1px solid #eceef5; font-size: 12px; color: #0b1220; font-weight: 600;">{{job_position}}</td>
                                      </tr>
                                      <tr>
                                        <td valign="top" style="padding: 10px; background: #fbfbfe; border-bottom: 1px solid #eceef5; font-size: 12px; color: #5b647a;">Open to Work Immediately?</td>
                                        <td valign="top" style="padding: 10px; border-bottom: 1px solid #eceef5; font-size: 12px; color: #0b1220;">{{open_to_work}}</td>
                                      </tr>
                                      <tr>
                                        <td valign="top" style="padding: 10px; background: #fbfbfe; border-bottom: 1px solid #eceef5; font-size: 12px; color: #5b647a;">Email Address</td>
                                        <td valign="top" style="padding: 10px; border-bottom: 1px solid #eceef5; font-size: 12px; color: #0b1220;">
                                          <a href="mailto:{{candidate_email}}" style="color: #2563eb; text-decoration: underline;">{{candidate_email}}</a>
                                        </td>
                                      </tr>
                                      <tr>
                                        <td valign="top" style="padding: 10px; background: #fbfbfe; border-bottom: 1px solid #eceef5; font-size: 12px; color: #5b647a;">Phone / Contact</td>
                                        <td valign="top" style="padding: 10px; border-bottom: 1px solid #eceef5; font-size: 12px; color: #0b1220;">{{candidate_phone}}</td>
                                      </tr>
                                      <tr>
                                        <td valign="top" style="padding: 10px; background: #fbfbfe; border-bottom: 1px solid #eceef5; font-size: 12px; color: #5b647a;">Country / Region</td>
                                        <td valign="top" style="padding: 10px; border-bottom: 1px solid #eceef5; font-size: 12px; color: #0b1220;">{{candidate_country}}</td>
                                      </tr>
                                      <tr>
                                        <td valign="top" style="padding: 10px; background: #fbfbfe; border-bottom: 1px solid #eceef5; font-size: 12px; color: #5b647a;">Years of Relevant Experience</td>
                                        <td valign="top" style="padding: 10px; border-bottom: 1px solid #eceef5; font-size: 12px; color: #0b1220;">{{experience_years}}</td>
                                      </tr>
                                      <tr>
                                        <td valign="top" style="padding: 10px; background: #fbfbfe; font-size: 12px; color: #5b647a;">Core Technologies</td>
                                        <td valign="top" style="padding: 10px; font-size: 12px; color: #0b1220;">{{languages_known}}</td>
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
                  </table>

                  <div style="height: 12px; line-height: 12px;">&nbsp;</div>

                  <!-- Section 2: Portfolio & Online Profiles -->
                  <table role="presentation" border="0" width="100%" cellspacing="0" cellpadding="0">
                    <tbody>
                      <tr>
                        <td style="padding: 10px; background: #f6f7fb; border-radius: 14px;">
                          <table role="presentation" border="0" width="100%" cellspacing="0" cellpadding="0" style="border: 1px solid #eceef5; border-radius: 12px; background: #ffffff; overflow: hidden;">
                            <tbody>
                              <tr>
                                <td style="padding: 14px 16px 10px 16px; background: #fbfbfe; border-bottom: 1px solid #eceef5;">
                                  <div style="font-family: inherit; font-size: 13px; color: #0b1220; font-weight: bold;">
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
                                          <a href="{{github_url}}" target="_blank" style="color: #2563eb; text-decoration: underline;">{{github_url}}</a>
                                        </td>
                                      </tr>
                                      <tr>
                                        <td valign="top" style="padding: 10px; background: #fbfbfe; border-bottom: 1px solid #eceef5; font-size: 12px; color: #5b647a;">LinkedIn Profile</td>
                                        <td valign="top" style="padding: 10px; border-bottom: 1px solid #eceef5; font-size: 12px; color: #0b1220;">
                                          <a href="{{linkedin_url}}" target="_blank" style="color: #2563eb; text-decoration: underline;">{{linkedin_url}}</a>
                                        </td>
                                      </tr>
                                      <tr>
                                        <td valign="top" style="padding: 10px; background: #fbfbfe; font-size: 12px; color: #5b647a;">CV / Resume Link</td>
                                        <td valign="top" style="padding: 10px; font-size: 12px; color: #0b1220;">
                                          <a href="{{cv_drive_url}}" target="_blank" style="color: #2563eb; text-decoration: underline;">View Candidate Resume</a>
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
                  </table>

                  <div style="height: 12px; line-height: 12px;">&nbsp;</div>

                  <!-- Section 3: Compensation & Commitment -->
                  <table role="presentation" border="0" width="100%" cellspacing="0" cellpadding="0">
                    <tbody>
                      <tr>
                        <td style="padding: 10px; background: #f6f7fb; border-radius: 14px;">
                          <table role="presentation" border="0" width="100%" cellspacing="0" cellpadding="0" style="border: 1px solid #eceef5; border-radius: 12px; background: #ffffff; overflow: hidden;">
                            <tbody>
                              <tr>
                                <td style="padding: 14px 16px 10px 16px; background: #fbfbfe; border-bottom: 1px solid #eceef5;">
                                  <div style="font-family: inherit; font-size: 13px; color: #0b1220; font-weight: bold;">
                                    Section 3 — Compensation &amp; Availability
                                  </div>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 10px 14px;">
                                  <table role="presentation" border="0" width="100%" cellspacing="0" cellpadding="0" style="border: 1px solid #eceef5; border-radius: 10px; overflow: hidden; background: #ffffff;">
                                    <tbody>
                                      <tr>
                                        <td valign="top" width="45%" style="padding: 10px; background: #fbfbfe; border-bottom: 1px solid #eceef5; font-size: 12px; color: #5b647a;">Current Compensation</td>
                                        <td valign="top" style="padding: 10px; border-bottom: 1px solid #eceef5; font-size: 12px; color: #0b1220;">{{current_salary}}</td>
                                      </tr>
                                      <tr>
                                        <td valign="top" style="padding: 10px; background: #fbfbfe; border-bottom: 1px solid #eceef5; font-size: 12px; color: #5b647a;">Asking Compensation</td>
                                        <td valign="top" style="padding: 10px; border-bottom: 1px solid #eceef5; font-size: 12px; color: #0b1220; font-weight: 600;">{{asking_salary}}</td>
                                      </tr>
                                      <tr>
                                        <td valign="top" style="padding: 10px; background: #fbfbfe; font-size: 12px; color: #5b647a;">Full-time 40-45 hrs/week Commitment?</td>
                                        <td valign="top" style="padding: 10px; font-size: 12px; color: #0b1220;">{{full_time_commitment}}</td>
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
                  </table>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding: 16px 24px; background: #fbfbfe; border-top: 1px solid #eceef5;">
                  <div style="font-family: inherit; font-size: 11px; line-height: 16px; color: #7a849b;">
                    Submission captured by <strong style="color: #0b1220;">WP Exam Application Engine</strong>.<br>
                    <span style="color: #a1a9bd;">{{company_name}} • Automated Notification Pipeline</span>
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

  // First handle {{key|default('...')}} or {{key|default("...")}}
  let result = template.replace(/\{\{\s*(\w+)\s*\|\s*default\((['"])(.*?)\2\)\s*\}\}/g, (_, key, __, defaultVal) => {
    const val = variables[key];
    if (val !== undefined && val !== null && String(val).trim().length > 0) {
      return String(val);
    }
    return defaultVal;
  });

  // Then handle standard {{key}}
  result = result.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key) => {
    const val = variables[key];
    if (val !== undefined && val !== null) {
      return String(val);
    }
    return '';
  });

  return result;
}
