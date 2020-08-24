const Manager = require("./lib/Manager");
const Engineer = require("./lib/Engineer");
const Intern = require("./lib/Intern");
const inquirer = require("inquirer");
const path = require("path");
const fs = require("fs");
const validator = require("validator");

const OUTPUT_DIR = path.resolve(__dirname, "output");
const outputPath = path.join(OUTPUT_DIR, "team.html");

const render = require("./lib/htmlRenderer");
const { workers } = require("cluster");
const { isError } = require("util");

let employees = [];

// Write code to use inquirer to gather information about the development team members,
// and to create objects for each team member (using the correct classes as blueprints!)

function getEmployeeInfo() {
    return inquirer.prompt([
        {
            type: "input",
            name: "name",
            message: "Name:",
            validate: validateName
        },
        {
            type: "input",
            name: "id",
            message: "ID:",
            validate: validateId
        },
        {
            type: "input",
            name: "email",
            message: "Email:",
            validate: validateEmail
        },
        {
            type: "list",
            name: "role",
            message: "Employee type:",
            choices: ["Manager", "Engineer", "Intern"]
        }
    ]);
}

function validateName(name) {
    if (!validator.isLength(name, {min: 2, max: 20}) || validator.isInt(name)) {
        return "Name must be between 2 and 20 characters";
    }

    return true;
}

function validateId(id) {
    if (!validator.isInt(id, {gt: 10000, lt: 99999})) {
        return "The ID must be a number of 5 digits";
    }

    return true;
}

function validateEmail(email) {
    if (!validator.isEmail(email)) {
        return "Not valid email format";
    }
    return true;
}

function getManagerInfo() {
    return inquirer.prompt ([
        {
            type: "input",
            name: "office",
            message: "OfficeNumber:",
            validate: validateOfficeNumber
        }])
}

function validateOfficeNumber(office) {
    if (!validator.isInt(office, {gt: 1, lt: 9999})) {
        return "The ID must be a number between 1 and 9999";
    }

    return true;
}

function getEngineerInfo() {
    return inquirer.prompt ([
        {
            type: "input",
            name: "github",
            message: "GitHub:",
            validate: validateGithub
        }])
}

function validateGithub(github) {
    if (validator.isEmpty(github)) {
        return "GitHub cannot be empty."
    }

    return true;
}

function getInternInfo() {
    return inquirer.prompt ([
        {
            type: "input",
            name: "school",
            message: "School:",
            validate: validateSchool
        }])
}

function validateSchool(school) {
    if (validator.isEmpty(school)) {
        return "School cannot be empty."
    }

    return true;
}

function quit() {
    console.log("\nGoodbye!");
    // process.exit(0);
}

async function promptNewOrQuit() {
    const answer = await inquirer.prompt([
        {
            type: "confirm",
            name: "choice",
            message: "Would like to add a new Emlpoyee?"
        }
    ])

    if (answer.choice) {
        await addEmployees();
    }
    else {
        quit();
    }
}

async function createEmployeeFromUserInput() {
    const employeeInfo = await getEmployeeInfo();
    switch (employeeInfo.role) {
        case "Manager":
            const managerInfo = await getManagerInfo();
            return new Manager(employeeInfo.name, employeeInfo.id, employeeInfo.email, managerInfo.office);
        case "Engineer":
            const engineerInfo = await getEngineerInfo();
            return new Engineer(employeeInfo.name, employeeInfo.id, employeeInfo.email, engineerInfo.github);
        case "Intern":
            const internInfo = await getInternInfo();
            return new Intern(employeeInfo.name, employeeInfo.id, employeeInfo.email, internInfo.school);
    }
}

async function addEmployees() {
    const employee = await createEmployeeFromUserInput();
    employees.push(employee);
    await promptNewOrQuit();
}

function writeToFile(data) {
    fs.writeFile(
        outputPath,
        data,
        (err) => {
            if (err) throw err;
            console.log(`File has been saved!`);
        }
    );
}


async function run() {
    try {
        await addEmployees();
        console.log(employees);
        const html = render(employees);
        console.log(html);
        writeToFile(html);
    }
    catch(err) {
        console.log(err);
    }
}

run();




// After the user has input all employees desired, call the `render` function (required
// above) and pass in an array containing all employee objects; the `render` function will
// generate and return a block of HTML including templated divs for each employee!

// After you have your html, you're now ready to create an HTML file using the HTML
// returned from the `render` function. Now write it to a file named `team.html` in the
// `output` folder. You can use the variable `outputPath` above target this location.
// Hint: you may need to check if the `output` folder exists and create it if it
// does not.

// HINT: each employee type (manager, engineer, or intern) has slightly different
// information; write your code to ask different questions via inquirer depending on
// employee type.

// HINT: make sure to build out your classes first! Remember that your Manager, Engineer,
// and Intern classes should all extend from a class named Employee; see the directions
// for further information. Be sure to test out each class and verify it generates an
// object with the correct structure and methods. This structure will be crucial in order
// for the provided `render` function to work! ```
