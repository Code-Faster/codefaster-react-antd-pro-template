import path from "path";
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
const model = {
  // 表名
  tableName: "T_TEST",
  // 注释
  tableComment: "generatorVO",
  // 表单字段数组
  tableCloums: [
    { columnComment: "ID", columnType: "Long", columnName: "id" },
    {
      columnComment: "用户id",
      columnType: "Long",
      columnName: "personId",
    },
    {
      columnComment: " 加时间",
      columnType: "Date",
      columnName: "inputDate",
    },
  ],
};
describe("TemplateTools", () => {
  it("init should work", () => {
    const tools = new TemplateTools(project);
    tools.init();
  });
  it("updateProjectConfig should work", () => {
    const tools = new TemplateTools(project);
    const obj = tools.updateProjectConfig();
    expect(obj.children).toHaveLength(1);
  });
  it("fileDisplay should work", () => {
    const tools = new TemplateTools(project);
    tools.fileDisplay(templateObj);
    expect(templateObj.children.length).toBe(1);
  });
});

describe("CodeGenerator", () => {
  it("generatorPage should work", () => {
    const code = new CodeGenerator(project);
    code.generatorPage({
      props: {},
      model: model,
      releasePath: path.join(__dirname, "../../../playground/test"),
    });
  });
});
