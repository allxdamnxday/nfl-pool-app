const fs = require('fs');
const path = require('path');

// List of target directories
const targetDirectories = [
    './__mocks__',
    './__tests__',
    './config',
    './controllers',
    './middleware',
    './models',
    './routes',
    './services',
    './utils'
];

// Function to process each file
const processFile = (filePath, baseOutputDir) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error(`Error reading file ${filePath}:`, err);
            return;
        }

        // Extract the first line comment
        const firstLine = data.split('\n')[0].trim();
        let comment;

        if (firstLine.startsWith('//')) {
            comment = firstLine.replace('//', '').trim();
        } else if (firstLine.startsWith('/*') && firstLine.endsWith('*/')) {
            comment = firstLine.replace('/*', '').replace('*/', '').trim();
        }

        if (!comment) {
            console.warn(`No comment found in ${filePath}`);
            return;
        }

        const newFileName = comment.replace(/\//g, '-').replace(/\\/g, '-') + '.js';
        const newFilePath = path.join(baseOutputDir, newFileName);

        // Write the new file
        fs.writeFile(newFilePath, data, (err) => {
            if (err) {
                console.error(`Error writing file ${newFilePath}:`, err);
            } else {
                console.log(`File copied to ${newFilePath}`);
            }
        });
    });
};

// Function to iterate over all .js files in a directory
const processDirectory = (dirPath, baseOutputDir) => {
    fs.readdir(dirPath, (err, files) => {
        if (err) {
            console.error(`Error reading directory ${dirPath}:`, err);
            return;
        }

        files.forEach((file) => {
            const filePath = path.join(dirPath, file);

            // Check if it's a .js file
            if (path.extname(file) === '.js') {
                processFile(filePath, baseOutputDir);
            }
        });
    });
};

// Create the base output directory
const baseOutputDir = path.join(__dirname, 'forGPT');
fs.mkdir(baseOutputDir, { recursive: true }, (err) => {
    if (err) {
        console.error(`Error creating base output directory:`, err);
        return;
    }

    // Process each target directory
    targetDirectories.forEach((dir) => {
        processDirectory(dir, baseOutputDir);
    });
});
