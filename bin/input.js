import inquirer from "inquirer";
import fs from "fs";

export default (callback) => inquirer
.prompt([
  {
      name: "path",
      type: "input",
      default: './',
      message: '请输入要创建文件的路径',
  },
  {
    name: "name",
    type: "input",
    default: 'home',
    message: '请输入要创建文件的名称',
    },
])
.then((answers) => {
    callback(answers)
})
.catch((error) => {
  if (error.isTtyError) {
    // Prompt couldn't be rendered in the current environment
  } else {
    // Something else went wrong
    console.log(error);
  }
});