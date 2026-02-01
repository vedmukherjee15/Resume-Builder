import { ResumeData } from '@/types/resume';
import fs from 'fs';
import path from 'path';

function escapeLatex(text: any): string {
  if (text === undefined || text === null) return '';
  const str = String(text);
  return str
    .replace(/\\/g, '\\textbackslash{}')
    .replace(/[&%$#_{}]/g, '\\$&')
    .replace(/~/g, '\\textasciitilde{}')
    .replace(/\^/g, '\\textasciicircum{}');
}

export function generateLatexFromTemplate(data: ResumeData, templateName: string = 'professional'): string {
  const templatePath = path.join(process.cwd(), 'src', 'templates', `${templateName}.tex`);
  let template = fs.readFileSync(templatePath, 'utf-8');

  const isClassBased = ['faangpath', 'business_insider'].includes(templateName);
  const isAltaCV = templateName === 'business_insider';

  // Helper for multiple replacements
  const replace = (tmpl: string, key: string, val: string) => tmpl.split(key).join(val);

  // Helper to extract handle from URL (e.g. linkedin.com/in/handle -> handle)
  const getHandle = (url: string) => {
    if (!url) return '';
    return url.replace(/^(https?:\/\/)?(www\.)?(linkedin\.com\/in\/|github\.com\/)/, '').replace(/\/$/, '');
  };

  // Personal Info
  template = replace(template, '{{NAME}}', escapeLatex(data.personalInfo.name));
  template = replace(template, '{{EMAIL}}', escapeLatex(data.personalInfo.email));
  template = replace(template, '{{PHONE}}', escapeLatex(data.personalInfo.phone));
  template = replace(template, '{{LOCATION}}', escapeLatex(data.personalInfo.location));
  
  // Tagline (AltaCV)
  if (isAltaCV) {
    const tagline = data.summary.split('.')[0]; // Use first sentence as tagline
    template = replace(template, '{{TAGLINE}}', escapeLatex(tagline));
  }

  // Optional links
  if (isAltaCV) {
    template = replace(template, '{{LINKEDIN}}', getHandle(data.personalInfo.linkedin || ''));
    template = replace(template, '{{GITHUB}}', getHandle(data.personalInfo.github || ''));
  } else if (isClassBased) {
    template = replace(template, '{{LINKEDIN}}', data.personalInfo.linkedin ? `\\href{https://${escapeLatex(data.personalInfo.linkedin)}}{LinkedIn}` : '');
    template = replace(template, '{{GITHUB}}', data.personalInfo.github ? `\\href{https://${escapeLatex(data.personalInfo.github)}}{GitHub}` : '');
    template = replace(template, '{{PORTFOLIO}}', data.personalInfo.portfolio ? `\\href{https://${escapeLatex(data.personalInfo.portfolio)}}{Portfolio}` : '');
  } else {
    template = replace(template, '{{LINKEDIN_SECTION}}', data.personalInfo.linkedin ? ` $|$ \\href{https://${escapeLatex(data.personalInfo.linkedin)}}{LinkedIn}` : '');
    template = replace(template, '{{GITHUB_SECTION}}', data.personalInfo.github ? ` $|$ \\href{https://${escapeLatex(data.personalInfo.github)}}{GitHub}` : '');
    template = replace(template, '{{PORTFOLIO_SECTION}}', data.personalInfo.portfolio ? ` $|$ \\href{https://${escapeLatex(data.personalInfo.portfolio)}}{Portfolio}` : '');
  }

  // Summary / Objective
  template = replace(template, '{{SUMMARY}}', escapeLatex(data.summary));

  // Skills
  let skillsText = '';
  if (isAltaCV) {
    skillsText = data.skills.map(skill => `\\cvtag{${escapeLatex(skill)}}`).join('\n');
  } else {
    skillsText = isClassBased 
      ? data.skills.map(skill => escapeLatex(skill)).join(', ')
      : data.skills.map(skill => escapeLatex(skill)).join(' $|$ ');
  }
  template = replace(template, '{{SKILLS}}', skillsText);

  // Experience
  const experienceLatex = data.experience.map(exp => {
    const bullets = exp.bullets.map(bullet => (isClassBased || isAltaCV)
      ? `      \\item ${escapeLatex(bullet)}`
      : `      \\resumeItem{${escapeLatex(bullet)}}`
    ).join('\n');
    
    if (isAltaCV) {
      return `\\cvevent{${escapeLatex(exp.title)}}{${escapeLatex(exp.company)}}{${escapeLatex(exp.duration)}}{${exp.location ? escapeLatex(exp.location) : ''}}
\\begin{itemize}
${bullets}
\\end{itemize}`;
    } else if (isClassBased) {
      return `\\begin{rSubsection}{${escapeLatex(exp.company)}}{${escapeLatex(exp.duration)}}{${escapeLatex(exp.title)}}{${exp.location ? escapeLatex(exp.location) : ''}}
${bullets}
\\end{rSubsection}`;
    } else {
      return `    \\resumeSubheading
      {${escapeLatex(exp.company)}}{${escapeLatex(exp.duration)}}
      {${escapeLatex(exp.title)}}{${exp.location ? escapeLatex(exp.location) : ''}}
      \\resumeItemListStart
${bullets}
      \\resumeItemListEnd`;
    }
  }).join('\n\n');
  template = replace(template, '{{EXPERIENCE}}', experienceLatex);

  // Education
  const educationLatex = data.education.map(edu => {
    if (isAltaCV) {
      return `\\cvevent{${escapeLatex(edu.degree)}}{${escapeLatex(edu.institution)}}{${escapeLatex(edu.year)}}{${edu.location ? escapeLatex(edu.location) : ''}}`;
    } else if (isClassBased) {
      return `{\\bf ${escapeLatex(edu.degree)}}, ${escapeLatex(edu.institution)} \\hfill {${escapeLatex(edu.year)}} ${edu.gpa ? `\\\\ GPA: ${escapeLatex(edu.gpa)}` : ''}`;
    } else {
      const gpaText = edu.gpa ? ` - GPA: ${escapeLatex(edu.gpa)}` : '';
      return `    \\resumeSubheading
      {${escapeLatex(edu.institution)}}{${escapeLatex(edu.year)}}
      {${escapeLatex(edu.degree)}${gpaText}}{${edu.location ? escapeLatex(edu.location) : ''}}`;
    }
  }).join('\n\n');
  template = replace(template, '{{EDUCATION}}', educationLatex);

  // Projects (optional)
  if (data.projects && data.projects.length > 0) {
    const projectsLatex = data.projects.map(proj => {
      const techStack = proj.technologies.map(t => escapeLatex(t)).join(', ');
      if (isAltaCV) {
        return `\\textbf{${escapeLatex(proj.name)}} \\hfill \\textbf{[${escapeLatex(techStack)}]}
\\begin{itemize}
  \\item ${escapeLatex(proj.description)}
\\end{itemize}`;
      } else if (isClassBased) {
        return `\\item \\textbf{${escapeLatex(proj.name)}}. {${escapeLatex(proj.description)} \\textit{(${escapeLatex(techStack)})}}`;
      } else {
        return `    \\resumeSubheading
      {${escapeLatex(proj.name)}}{${techStack}}
      {${escapeLatex(proj.description)}}{}`;
      }
    }).join('\n\n');
    
    if (isAltaCV) {
      template = replace(template, '{{PROJECTS}}', projectsLatex);
    } else if (isClassBased) {
      template = replace(template, '{{PROJECTS}}', `\\begin{itemize}[leftmargin=*, label={}]\n${projectsLatex}\n\\end{itemize}`);
    } else {
      const projectsSection = `%-----------PROJECTS-----------
\\section{Projects}
  \\resumeSubHeadingListStart
${projectsLatex}
  \\resumeSubHeadingListEnd`;
      template = replace(template, '{{PROJECTS_SECTION}}', projectsSection);
    }
  } else {
    template = replace(template, '{{PROJECTS_SECTION}}', '');
    template = replace(template, '{{PROJECTS}}', '');
  }

  // Certifications / Extra-Curricular (optional)
  if (data.certifications && data.certifications.length > 0) {
    const certsList = data.certifications.map(cert => (isClassBased || isAltaCV)
      ? `    \\item ${escapeLatex(cert)}`
      : `    \\resumeItem{${escapeLatex(cert)}}`
    ).join('\n');
    
    if (isAltaCV) {
      template = replace(template, '{{CERTIFICATIONS}}', `\\begin{itemize}\n${certsList}\n\\end{itemize}`);
    } else if (isClassBased) {
       const extraSection = `\\begin{rSection}{Extra-Curricular Activities}\n\\begin{itemize}\n${certsList}\n\\end{itemize}\n\\end{rSection}`;
       template = replace(template, '{{CERTIFICATIONS_SECTION}}', extraSection);
    } else {
      const certificationsSection = `%-----------CERTIFICATIONS-----------
\\section{Certifications}
  \\resumeSubHeadingListStart
${certsList}
  \\resumeSubHeadingListEnd`;
      template = replace(template, '{{CERTIFICATIONS_SECTION}}', certificationsSection);
    }
  } else {
    template = replace(template, '{{CERTIFICATIONS_SECTION}}', '');
    template = replace(template, '{{CERTIFICATIONS}}', '');
  }

  return template;
}
