import path from "path";
import fs from "fs";
import { TemplateTools } from "../../../src/template";
import CodeGenerator from "../../../src/index";
const project = {
  projectName: "test",
  projectDir: path.join(__dirname, "../../../playground/test"),
  owner: "Code Faster",
  type: 2,
  templateId: 1,
  description: "Code Faster createTemplate",
  id: 1,
};
const templateObj = {
  fileName: "createTemplate",
  path: path.join(__dirname, "../../../playground/createTemplate"),
  formData: {},
  isDir: true,
  children: [],
};
describe("TemplateTools", () => {
  it("init should work", () => {
    const tools = new TemplateTools(project);
    tools.init();
  });
  it("updateProjectConfig should work", () => {
    const tools = new TemplateTools(project);
    const obj = tools.updateProjectConfig();
    expect(obj.children).toHaveLength(2);
  });
  it("fileDisplay should work", () => {
    const tools = new TemplateTools(project);
    tools.fileDisplay(templateObj);
    expect(templateObj.children.length).toBe(1);
  });
});

describe("CodeGenerator", () => {
  it("generatorPage should work", () => {
    const baseDir = path.join(__dirname, "../../../examples");
    const files = fs.readdirSync(baseDir);
    const code = new CodeGenerator(project);
    files.forEach((fileName) => {
      // 获取当前文件的绝对路径
      const filedir = path.join(baseDir, fileName);
      // 根据文件路径获取文件信息，返回一个fs.Stats对象
      const stats = fs.statSync(filedir);
      const isFile = stats.isFile(); // 是文件
      if (isFile) {
        const data = fs.readFileSync(filedir, "utf8");
        code.generatorPage({
          props: {},
          model: JSON.parse(data),
          releasePath: path.join(__dirname, "../../../playground/test"),
        });
      }
    });
  });
});
