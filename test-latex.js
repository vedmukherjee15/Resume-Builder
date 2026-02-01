const latex = require('node-latex');
const fs = require('fs');

const testLatex = `\\documentclass{article}
\\begin{document}
Hello World from LaTeX!
\\end{document}`;

console.log('Testing LaTeX compilation...');
console.log('LaTeX content:', testLatex);

const output = latex(testLatex, {
  cmd: 'pdflatex',
  passes: 1,
});

const chunks = [];

output.on('data', (chunk) => {
  console.log('Received chunk:', chunk.length, 'bytes');
  chunks.push(chunk);
});

output.on('end', () => {
  const buffer = Buffer.concat(chunks);
  console.log('PDF generated! Size:', buffer.length, 'bytes');
  fs.writeFileSync('/tmp/test-output.pdf', buffer);
  console.log('Saved to /tmp/test-output.pdf');
  process.exit(0);
});

output.on('error', (err) => {
  console.error('LaTeX compilation error:', err);
  process.exit(1);
});
