import path from "path";
import fs from "fs";
import parseIgnore from "parse-gitignore";
/** 配置文件默认名称 */
export const TEMPLATE_JSON = "cfconfig.json";
const __PRODUCTION__ = false;
let TEMPLATE_DIR = path.join(process.cwd(), "./playground/createTemplate");
// 实现build时候替换参数
if (__PRODUCTION__ === true) {
  TEMPLATE_DIR = path.join(__dirname, "./playground/createTemplate");
}
/** 静态目录模版目录名 */
export const TEMPLATE_MODEL_NAME = "createTemplate";
/** 忽略的文件 */
export const EXCLUDE_PATH = parseIgnore(
  fs.readFileSync(path.join(__dirname, ".cfignore"))
);

/**
 * 根据 _ 生成驼峰 , type 默认true 首字母大写,如果没有 _ 分隔符 , 则取第一个大写
 * @param {*} str
 */
export const tranformHumpStr = (str: string, type = true) => {
  if (str.length === 0) {
    return "";
  }
  if (str.indexOf("_") >= 0) {
    let strArr = str.split("_");
    strArr = strArr.map((ele) => {
      return ele.charAt(0).toUpperCase() + ele.substring(1).toLowerCase();
    });
    const result = strArr.join("");
    return type ? result : result.charAt(0).toLowerCase() + result.substring(1);
  }
  return type
    ? str.charAt(0).toUpperCase() + str.substring(1).toLowerCase()
    : str;
};
/**
 * 根据文件路径获取包名
 * @param filePath 文件路径
 * @param startFix 包名前缀
 */
export const getPackageName = (filePath: string, startFix: string) => {
  if (filePath.length === 0 || startFix.length === 0) {
    throw new Error("缺少参数!");
  }
  const fileObj = path.parse(filePath);
  const filePathArr = path.join(fileObj.dir, fileObj.name).split(path.sep);
  return filePathArr
    .filter((_ele: unknown, index: number) => {
      return index >= filePathArr.indexOf(startFix);
    })
    .join(".");
};

/**
 * 根据传入实体类获取参数变量
 * @param {*} str
 */
export const getParamVariableFormat = (str: string) => {
  return str.charAt(0).toLowerCase() + str.substring(1);
};

/** 格式化get set 方法 */
export const getSetFormat = (str: string) => {
  return str.charAt(0).toUpperCase() + str.substring(1);
};

/**
 * 模版工具类，初始化参数为Project 对象
 */
export class TemplateTools {
  private project: CodeFaster.Project = {
    owner: "",
    // 目录最终路径
    projectDir: "",
    projectName: "",
    type: 1,
    description: "",
    templateName: "",
  };
  private keyPathArr: Array<any> = [];
  // 配置文件路径
  private configPath: string = "";

  constructor(pj: CodeFaster.Project) {
    this.project = pj;
    this.keyPathArr = [];
    this.configPath = path.join(pj.projectDir, TEMPLATE_JSON);
  }
  /** 初始化项目 */
  init() {
    // 1、获取模版目录结构
    const templateConfig = this.getTemplateConfig();
    this.fileDisplay(templateConfig);
    // 2、生成新项目结构目录文件
    const projectConfig = this.getInitConfig(this.project);
    projectConfig.children = templateConfig.children;
    projectConfig.fromPath = templateConfig.path;
    this.replaceStructure(projectConfig);
    // 3、将模版修改后输出到产出目录
    this.copyCoding(projectConfig);
    // 4、将生成的目录文件copy到输出目录项目下
    fs.writeFileSync(
      path.join(this.project.projectDir, TEMPLATE_JSON),
      JSON.stringify(projectConfig)
    );
  }
  /**
   * 替换掉目录结构
   * @param structure 项目目录结构
   */
  replaceStructure(structure: CodeFaster.ConfigJSON) {
    // TODO: 测试windows平台是否效果一致
    const releasePath = this.project.projectDir;
    let fromPath = structure.path;
    structure.fromPath = fromPath;
    structure.path = fromPath
      .replaceAll(TEMPLATE_DIR, releasePath)
      .replaceAll(TEMPLATE_MODEL_NAME, this.project.projectName);
    if (structure.children.length > 0) {
      structure.children.forEach((obj: CodeFaster.ConfigJSON) => {
        const fromPath = obj.fromPath;
        obj.fromPath = fromPath;
        fromPath &&
          (obj.path = fromPath
            .replaceAll(TEMPLATE_DIR, releasePath)
            .replaceAll(TEMPLATE_MODEL_NAME, this.project.projectName));
        this.replaceStructure(obj);
      });
    }
  }

  /**
   * 根据文件名、搜索目录获取唯一文件
   * @param fileName
   */
  findOneFileByKey(fileName: string) {
    const filePathArr = this.findByKey(fileName, 1);
    if (filePathArr.length > 1) {
      throw new Error("搜索出错，文件数量超出");
    }
    return filePathArr.length == 1 ? filePathArr[0] : { value: "" };
  }

  /**
   * 根据文件名获取package
   * @param {文件名} file_name
   */
  getPackageNameByFileName(fileName: string) {
    let searchFilePath = this.findOneFileByKey(fileName).value;
    return searchFilePath.length > 0
      ? getPackageName(searchFilePath, "com")
      : "";
  }
  /**
   * 根据关键字获取文件信息
   * @param key
   * @param type 搜索文件夹 还是 文件 默认0 :文件夹 1: 文件 2、模糊搜索文件
   */
  findByKey(key: string, type: number) {
    // 置空
    this.keyPathArr = [];
    const jsonData: CodeFaster.ConfigJSON = this.getJsonFromPath();
    this.serachJSON(jsonData, key, type);
    return this.keyPathArr;
  }

  /**
   * 根据文件转化json结构
   * @param isUpdate 是否强制更新文件
   * @param filePath 如果强制更新，是否指定读取更新文件地址
   */
  getJsonFromPath = (
    isUpdate?: boolean,
    filePath?: string
  ): CodeFaster.ConfigJSON => {
    let configPath = this.configPath;
    // 如果导入的时候指定文件
    if (filePath) {
      configPath = filePath;
    }
    const stats = fs.statSync(configPath);
    if (stats.isFile()) {
      let jsonData: CodeFaster.ConfigJSON = JSON.parse(
        fs.readFileSync(configPath, "utf-8")
      );
      // 处理项目文件目录
      if (isUpdate) {
        // 重新生成
        jsonData.path = path.parse(configPath).dir;
        if (jsonData.project && jsonData.project !== undefined) {
          if (this.project) {
            jsonData.project = { ...this.project };
          }
          // buildPath 去除项目名称
          const arr = path.parse(configPath).dir.split(path.sep);
          jsonData.project.projectDir = arr.join(path.sep);
        } else {
          throw Error("config缺少project属性");
        }
        return this.showStructure(jsonData.project);
      }
      return jsonData;
    }
    throw Error("文件地址格式不正确！");
  };

  showStructure(project: CodeFaster.Project): CodeFaster.ConfigJSON {
    let dir_structure: CodeFaster.ConfigJSON = this.getInitConfig(project);
    this.fileDisplay(dir_structure);
    return dir_structure;
  }
  /**
   * 拷贝模版代码，复制模版代码，内部做关键字替换
   * @param structure
   */
  copyCoding(structure: CodeFaster.ConfigJSON) {
    if (!fs.existsSync(structure.path)) {
      fs.mkdirSync(structure.path);
    }
    if (structure.isDir) {
      if (structure.children.length > 0) {
        // 如果是文件夹
        structure.children.forEach((obj: CodeFaster.ConfigJSON) => {
          // 如果子目录是dir
          if (obj.isDir) this.copyCoding(obj);
          else {
            const data = fs.readFileSync(obj.fromPath || "", "utf8");
            const result = data.replace(
              new RegExp(TEMPLATE_MODEL_NAME, "g"),
              this.project.projectName
            );
            fs.writeFileSync(obj.path, result, "utf8");
          }
        });
      }
    } else {
      // 如果不是文件夹
      const data = fs.readFileSync(structure.fromPath || "", "utf8");
      const result = data.replace(
        new RegExp(TEMPLATE_MODEL_NAME, "g"),
        this.project.projectName
      );
      fs.writeFileSync(structure.path, result, "utf8");
    }
  }

  /**
   * 遍历文件目录结构
   * @param fileObj
   */
  fileDisplay(fileObj: CodeFaster.ConfigJSON) {
    // 根据文件路径读取文件，返回文件列表
    const files = fs.readdirSync(fileObj.path);
    // 遍历读取到的文件列表
    files.forEach((fileName) => {
      // 获取当前文件的绝对路径
      const filedir = path.join(fileObj.path, fileName);
      // 根据文件路径获取文件信息，返回一个fs.Stats对象
      const stats = fs.statSync(filedir);
      const isFile = stats.isFile(); // 是文件
      const isDir = stats.isDirectory(); // 是文件夹
      const isExcludeFlag = EXCLUDE_PATH.filter((ele) => {
        return fileName.includes(ele); // 注意不能使用路径，因为可能在GUI里包含到忽略文件
      });
      if (isExcludeFlag.length > 0) {
        return;
      }
      if (isFile) {
        // 根据 fileObj 判读缓存数据 是否存在父亲目录
        const fileArr = fileObj.children.filter((ele: any) => {
          return ele.path === fileObj.path;
        });
        const obj: CodeFaster.ConfigJSON = {
          fileName,
          path: filedir,
          sortPath: fileObj.project?.projectDir
            ? path.relative(fileObj.project?.projectDir, filedir)
            : fileName,
          isDir: !isFile,
          children: [],
        };
        // 如果有父级
        if (fileArr.length === 1) {
          fileArr[0].children.push(obj);
        } else {
          fileObj.children.push(obj);
        }
      }
      if (isDir) {
        const obj: CodeFaster.ConfigJSON = {
          fileName,
          path: filedir,
          sortPath: fileObj.project?.projectDir
            ? path.relative(fileObj.project?.projectDir, filedir)
            : fileName,
          isDir,
          children: [],
        };
        // 根据 fileObj 判读缓存数据 是否存在父亲目录
        const dirArr = fileObj.children.filter((ele: any) => {
          return ele.path === fileObj.path;
        });
        // 如果有父级
        if (dirArr.length === 1) {
          dirArr[0].children.push(obj);
        } else {
          fileObj.children.push(obj);
        }
        this.fileDisplay(obj); // 递归，如果是文件夹，就继续遍历该文件夹下面的文件
      }
    });
  }

  /**
   * 获取初始化config
   * @param project 项目参数
   * @returns
   */
  getInitConfig(project: CodeFaster.Project) {
    return {
      fileName: project.projectName,
      path: project.projectDir,
      sortPath: path.relative(project.projectDir, project.projectDir),
      isDir: true,
      project: project,
      children: [],
    } as CodeFaster.ConfigJSON;
  }

  /**
   * 获取模版config
   * @returns
   */
  getTemplateConfig() {
    return {
      fileName: TEMPLATE_MODEL_NAME,
      path: TEMPLATE_DIR,
      sortPath: path.relative(TEMPLATE_DIR, TEMPLATE_DIR),
      isDir: true,
      children: [],
    } as CodeFaster.ConfigJSON;
  }

  /**
   * 更新项目目录结构
   */
  updateProjectConfig() {
    try {
      if (fs.existsSync(this.configPath)) {
        const configJSON: CodeFaster.ConfigJSON = this.getJsonFromPath(true);
        fs.writeFileSync(this.configPath, JSON.stringify(configJSON));
        return configJSON;
      }
    } catch (error: unknown) {
      throw Error("updateProjectConfig throw error : " + error);
    }
  }

  /**
   * 根据文档结构json 迭代出匹配关键字地址
   * @param jsonData 目录结构json
   * @param key   关键字
   * @param type 搜索文件夹 还是 文件 默认0 :文件夹 1: 文件 2、模糊搜索文件
   */
  serachJSON(jsonData: CodeFaster.ConfigJSON, key: string, type: number) {
    // 如果是文件夹
    if (jsonData.isDir) {
      if (jsonData.fileName === key && type === 0) {
        this.keyPathArr.push({
          label: jsonData.sortPath,
          value: jsonData.path,
          children: jsonData.children,
        });
      }
      // 如果还有子文件, 递归执行
      if (jsonData.children.length > 0) {
        jsonData.children.forEach((obj: CodeFaster.ConfigJSON) => {
          this.serachJSON(obj, key, type);
        });
      }
    } else {
      // 如果搜索文件
      if (type === 1 && jsonData.fileName === key) {
        this.keyPathArr.push({
          label: jsonData.sortPath,
          value: jsonData.path,
        });
      }
      if (type === 2 && jsonData.fileName.includes(key)) {
        this.keyPathArr.push({
          label: jsonData.sortPath,
          value: jsonData.path,
        });
      }
    }
  }
}
