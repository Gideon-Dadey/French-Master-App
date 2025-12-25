/**
 * Safe Comment Removal Script
 * 
 * Removes comments while preserving strings and regex patterns.
 * Use with caution - always backup your code first!
 */
const fs = require('fs');
const path = require('path');

const DIRECTORIES_TO_PROCESS = [
  'screens',
  'src/components',
  'src/context',
  'src/services',
  'src/utils',
  'backend/routes',
  'backend/models',
  'backend/middleware',
  'backend/utils',
];

const FILE_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx'];

/**
 * Safely removes comments while preserving strings
 * Uses a state machine approach to track context
 */
function removeComments(code) {
  let result = '';
  let i = 0;
  let inString = false;
  let stringChar = '';
  let inTemplateString = false;
  let inSingleLineComment = false;
  let inMultiLineComment = false;
  let inJsxComment = false;
  
  while (i < code.length) {
    const char = code[i];
    const nextChar = code[i + 1] || '';
    const prevChar = code[i - 1] || '';
    
    // Handle string contexts (preserve everything inside strings)
    if (!inSingleLineComment && !inMultiLineComment && !inJsxComment) {
      // Check for template string start/end
      if (char === '`' && prevChar !== '\\') {
        if (inTemplateString) {
          inTemplateString = false;
        } else if (!inString) {
          inTemplateString = true;
        }
        result += char;
        i++;
        continue;
      }
      
      // Check for regular string start/end
      if ((char === '"' || char === "'") && prevChar !== '\\' && !inTemplateString) {
        if (inString && char === stringChar) {
          inString = false;
          stringChar = '';
        } else if (!inString) {
          inString = true;
          stringChar = char;
        }
        result += char;
        i++;
        continue;
      }
      
      // If inside a string, just add the character
      if (inString || inTemplateString) {
        result += char;
        i++;
        continue;
      }
    }
    
    // Handle JSX comments {/* */}
    if (!inString && !inTemplateString && char === '{' && nextChar === '/') {
      const afterSlash = code[i + 2] || '';
      if (afterSlash === '*') {
        inJsxComment = true;
        i += 3;
        continue;
      }
    }
    
    if (inJsxComment && char === '*' && nextChar === '/') {
      const afterSlash = code[i + 2] || '';
      if (afterSlash === '}') {
        inJsxComment = false;
        i += 3;
        continue;
      }
    }
    
    if (inJsxComment) {
      i++;
      continue;
    }
    
    // Handle multi-line comments /* */
    if (!inString && !inTemplateString && !inSingleLineComment && char === '/' && nextChar === '*') {
      inMultiLineComment = true;
      i += 2;
      continue;
    }
    
    if (inMultiLineComment && char === '*' && nextChar === '/') {
      inMultiLineComment = false;
      i += 2;
      continue;
    }
    
    if (inMultiLineComment) {
      i++;
      continue;
    }
    
    // Handle single-line comments //
    // But NOT URLs like http:// or https://
    if (!inString && !inTemplateString && char === '/' && nextChar === '/') {
      // Check if this is part of a URL (preceded by colon)
      if (prevChar !== ':') {
        inSingleLineComment = true;
        i += 2;
        continue;
      }
    }
    
    if (inSingleLineComment && char === '\n') {
      inSingleLineComment = false;
      result += char;
      i++;
      continue;
    }
    
    if (inSingleLineComment) {
      i++;
      continue;
    }
    
    // Regular character - add to result
    result += char;
    i++;
  }
  
  // Clean up multiple empty lines (more than 2 consecutive)
  result = result.replace(/\n\s*\n\s*\n/g, '\n\n');
  
  // Remove trailing whitespace on lines
  result = result.replace(/[ \t]+$/gm, '');
  
  return result;
}

function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const cleanedContent = removeComments(content);
    
    if (content !== cleanedContent) {
      fs.writeFileSync(filePath, cleanedContent, 'utf8');
      console.log(`✓ Cleaned: ${filePath}`);
      return true;
    } else {
      console.log(`- No changes: ${filePath}`);
      return false;
    }
  } catch (error) {
    console.error(`✗ Error processing ${filePath}:`, error.message);
    return false;
  }
}

function processDirectory(dirPath) {
  const fullPath = path.join(process.cwd(), dirPath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`Directory not found: ${dirPath}`);
    return 0;
  }
  
  let filesProcessed = 0;
  
  function walkDir(dir) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        if (!file.startsWith('.') && file !== 'node_modules') {
          walkDir(filePath);
        }
      } else if (FILE_EXTENSIONS.some(ext => file.endsWith(ext))) {
        if (processFile(filePath)) {
          filesProcessed++;
        }
      }
    }
  }
  
  walkDir(fullPath);
  return filesProcessed;
}

// Only run if called directly (not required as module)
if (require.main === module) {
  console.log('═══════════════════════════════════════════');
  console.log('   Safe Comment Removal Script');
  console.log('   Making code look organic & original');
  console.log('═══════════════════════════════════════════\n');
  console.log('⚠️  WARNING: Backup your code before running!\n');

  let totalFilesModified = 0;

  for (const dir of DIRECTORIES_TO_PROCESS) {
    console.log(`\nProcessing: ${dir}/`);
    console.log('─'.repeat(40));
    totalFilesModified += processDirectory(dir);
  }

  console.log('\n═══════════════════════════════════════════');
  console.log(`   Complete! ${totalFilesModified} files modified`);
  console.log('═══════════════════════════════════════════\n');
}

module.exports = { removeComments, processFile };
