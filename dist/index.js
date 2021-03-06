/*!
  * code-dubbo-template v0.0.2
  * (c) 2022 biqi li
  * @license MIT
  */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('fs'), require('path'), require('parse-gitignore')) :
  typeof define === 'function' && define.amd ? define(['fs', 'path', 'parse-gitignore'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.index = factory(global.fs, global.path, global.parseIgnore));
})(this, (function (fs, path, parseIgnore) { 'use strict';

  function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

  var fs__default = /*#__PURE__*/_interopDefaultLegacy(fs);
  var path__default = /*#__PURE__*/_interopDefaultLegacy(path);
  var parseIgnore__default = /*#__PURE__*/_interopDefaultLegacy(parseIgnore);

  function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);

    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      enumerableOnly && (symbols = symbols.filter(function (sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      })), keys.push.apply(keys, symbols);
    }

    return keys;
  }

  function _objectSpread2(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = null != arguments[i] ? arguments[i] : {};
      i % 2 ? ownKeys(Object(source), !0).forEach(function (key) {
        _defineProperty(target, key, source[key]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }

    return target;
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    Object.defineProperty(Constructor, "prototype", {
      writable: false
    });
    return Constructor;
  }

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  /** ???????????????????????? */

  var TEMPLATE_JSON = "cfconfig.json";
  var TEMPLATE_DIR = path__default["default"].join(process.cwd(), "./playground/createTemplate"); // ??????build??????????????????

  {
    TEMPLATE_DIR = path__default["default"].join(__dirname, "./playground/createTemplate");
  }
  /** ??????????????????????????? */


  var TEMPLATE_MODEL_NAME = "createTemplate";
  /** ??????????????? */

  var EXCLUDE_PATH = parseIgnore__default["default"](fs__default["default"].readFileSync(path__default["default"].join(__dirname, ".cfignore")));
  /**
   * ?????? _ ???????????? , type ??????true ???????????????,???????????? _ ????????? , ?????????????????????
   * @param {*} str
   */

  var tranformHumpStr = function tranformHumpStr(str) {
    var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

    if (str.length === 0) {
      return "";
    }

    if (str.indexOf("_") >= 0) {
      var strArr = str.split("_");
      strArr = strArr.map(function (ele) {
        return ele.charAt(0).toUpperCase() + ele.substring(1).toLowerCase();
      });
      var result = strArr.join("");
      return type ? result : result.charAt(0).toLowerCase() + result.substring(1);
    }

    return type ? str.charAt(0).toUpperCase() + str.substring(1).toLowerCase() : str;
  };
  /**
   * ??????????????????????????????
   * @param filePath ????????????
   * @param startFix ????????????
   */

  var getPackageName = function getPackageName(filePath, startFix) {
    if (filePath.length === 0 || startFix.length === 0) {
      throw new Error("????????????!");
    }

    var fileObj = path__default["default"].parse(filePath);
    var filePathArr = path__default["default"].join(fileObj.dir, fileObj.name).split(path__default["default"].sep);
    return filePathArr.filter(function (_ele, index) {
      return index >= filePathArr.indexOf(startFix);
    }).join(".");
  };
  /**
   * ???????????????????????????????????????
   * @param {*} str
   */

  var getParamVariableFormat = function getParamVariableFormat(str) {
    return str.charAt(0).toLowerCase() + str.substring(1);
  };
  /**
   * ????????????????????????????????????Project ??????
   */

  var TemplateTools = /*#__PURE__*/function () {
    function TemplateTools(pj) {
      var _this = this;

      _classCallCheck(this, TemplateTools);

      this.project = {
        owner: "",
        // ??????????????????
        projectDir: "",
        projectName: "",
        type: 1,
        description: "",
        templateName: ""
      };
      this.keyPathArr = []; // ??????????????????

      this.configPath = "";
      /**
       * ??????????????????json??????
       * @param isUpdate ????????????????????????
       * @param filePath ?????????????????????????????????????????????????????????
       */

      this.getJsonFromPath = function (isUpdate, filePath) {
        var configPath = _this.configPath; // ?????????????????????????????????

        if (filePath) {
          configPath = filePath;
        }

        var stats = fs__default["default"].statSync(configPath);

        if (stats.isFile()) {
          var jsonData = JSON.parse(fs__default["default"].readFileSync(configPath, "utf-8")); // ????????????????????????

          if (isUpdate) {
            // ????????????
            jsonData.path = path__default["default"].parse(configPath).dir;

            if (jsonData.project && jsonData.project !== undefined) {
              if (_this.project) {
                jsonData.project = _objectSpread2({}, _this.project);
              } // buildPath ??????????????????


              var arr = path__default["default"].parse(configPath).dir.split(path__default["default"].sep);
              jsonData.project.projectDir = arr.join(path__default["default"].sep);
            } else {
              throw Error("config??????project??????");
            }

            return _this.showStructure(jsonData.project);
          }

          return jsonData;
        }

        throw Error("??????????????????????????????");
      };

      this.project = pj;
      this.keyPathArr = [];
      this.configPath = path__default["default"].join(pj.projectDir, TEMPLATE_JSON);
    }
    /** ??????????????? */


    _createClass(TemplateTools, [{
      key: "init",
      value: function init() {
        // 1???????????????????????????
        var templateConfig = this.getTemplateConfig();
        this.fileDisplay(templateConfig); // 2????????????????????????????????????

        var projectConfig = this.getInitConfig(this.project);
        projectConfig.children = templateConfig.children;
        projectConfig.fromPath = templateConfig.path;
        this.replaceStructure(projectConfig); // 3??????????????????????????????????????????

        this.copyCoding(projectConfig); // 4???????????????????????????copy????????????????????????

        fs__default["default"].writeFileSync(path__default["default"].join(this.project.projectDir, TEMPLATE_JSON), JSON.stringify(projectConfig));
      }
      /**
       * ?????????????????????
       * @param structure ??????????????????
       */

    }, {
      key: "replaceStructure",
      value: function replaceStructure(structure) {
        var _this2 = this;

        // TODO: ??????windows????????????????????????
        var releasePath = this.project.projectDir;
        var fromPath = structure.path;
        structure.fromPath = fromPath;
        structure.path = fromPath.replaceAll(TEMPLATE_DIR, releasePath).replaceAll(TEMPLATE_MODEL_NAME, this.project.projectName);

        if (structure.children.length > 0) {
          structure.children.forEach(function (obj) {
            var fromPath = obj.fromPath;
            obj.fromPath = fromPath;
            fromPath && (obj.path = fromPath.replaceAll(TEMPLATE_DIR, releasePath).replaceAll(TEMPLATE_MODEL_NAME, _this2.project.projectName));

            _this2.replaceStructure(obj);
          });
        }
      }
      /**
       * ????????????????????????????????????????????????
       * @param fileName
       */

    }, {
      key: "findOneFileByKey",
      value: function findOneFileByKey(fileName) {
        var filePathArr = this.findByKey(fileName, 1);

        if (filePathArr.length > 1) {
          throw new Error("?????????????????????????????????");
        }

        return filePathArr.length == 1 ? filePathArr[0] : {
          value: ""
        };
      }
      /**
       * ?????????????????????package
       * @param {?????????} file_name
       */

    }, {
      key: "getPackageNameByFileName",
      value: function getPackageNameByFileName(fileName) {
        var searchFilePath = this.findOneFileByKey(fileName).value;
        return searchFilePath.length > 0 ? getPackageName(searchFilePath, "com") : "";
      }
      /**
       * ?????????????????????????????????
       * @param key
       * @param type ??????????????? ?????? ?????? ??????0 :????????? 1: ?????? 2?????????????????????
       */

    }, {
      key: "findByKey",
      value: function findByKey(key, type) {
        // ??????
        this.keyPathArr = [];
        var jsonData = this.getJsonFromPath();
        this.serachJSON(jsonData, key, type);
        return this.keyPathArr;
      }
    }, {
      key: "showStructure",
      value: function showStructure(project) {
        var dir_structure = this.getInitConfig(project);
        this.fileDisplay(dir_structure);
        return dir_structure;
      }
      /**
       * ??????????????????????????????????????????????????????????????????
       * @param structure
       */

    }, {
      key: "copyCoding",
      value: function copyCoding(structure) {
        var _this3 = this;

        if (!fs__default["default"].existsSync(structure.path)) {
          fs__default["default"].mkdirSync(structure.path);
        }

        if (structure.isDir) {
          if (structure.children.length > 0) {
            // ??????????????????
            structure.children.forEach(function (obj) {
              // ??????????????????dir
              if (obj.isDir) { _this3.copyCoding(obj); }else {
                var data = fs__default["default"].readFileSync(obj.fromPath || "", "utf8");
                var result = data.replace(new RegExp(TEMPLATE_MODEL_NAME, "g"), _this3.project.projectName);
                fs__default["default"].writeFileSync(obj.path, result, "utf8");
              }
            });
          }
        } else {
          // ?????????????????????
          var data = fs__default["default"].readFileSync(structure.fromPath || "", "utf8");
          var result = data.replace(new RegExp(TEMPLATE_MODEL_NAME, "g"), this.project.projectName);
          fs__default["default"].writeFileSync(structure.path, result, "utf8");
        }
      }
      /**
       * ????????????????????????
       * @param fileObj
       */

    }, {
      key: "fileDisplay",
      value: function fileDisplay(fileObj) {
        var _this4 = this;

        // ???????????????????????????????????????????????????
        var files = fs__default["default"].readdirSync(fileObj.path); // ??????????????????????????????

        files.forEach(function (fileName) {
          // ?????????????????????????????????
          var filedir = path__default["default"].join(fileObj.path, fileName); // ???????????????????????????????????????????????????fs.Stats??????

          var stats = fs__default["default"].statSync(filedir);
          var isFile = stats.isFile(); // ?????????

          var isDir = stats.isDirectory(); // ????????????

          var isExcludeFlag = EXCLUDE_PATH.filter(function (ele) {
            return fileName.includes(ele); // ??????????????????????????????????????????GUI????????????????????????
          });

          if (isExcludeFlag.length > 0) {
            return;
          }

          if (isFile) {
            var _fileObj$project, _fileObj$project2;

            // ?????? fileObj ?????????????????? ????????????????????????
            var fileArr = fileObj.children.filter(function (ele) {
              return ele.path === fileObj.path;
            });
            var obj = {
              fileName: fileName,
              path: filedir,
              sortPath: (_fileObj$project = fileObj.project) !== null && _fileObj$project !== void 0 && _fileObj$project.projectDir ? path__default["default"].relative((_fileObj$project2 = fileObj.project) === null || _fileObj$project2 === void 0 ? void 0 : _fileObj$project2.projectDir, filedir) : fileName,
              isDir: !isFile,
              children: []
            }; // ???????????????

            if (fileArr.length === 1) {
              fileArr[0].children.push(obj);
            } else {
              fileObj.children.push(obj);
            }
          }

          if (isDir) {
            var _fileObj$project3, _fileObj$project4;

            var _obj = {
              fileName: fileName,
              path: filedir,
              sortPath: (_fileObj$project3 = fileObj.project) !== null && _fileObj$project3 !== void 0 && _fileObj$project3.projectDir ? path__default["default"].relative((_fileObj$project4 = fileObj.project) === null || _fileObj$project4 === void 0 ? void 0 : _fileObj$project4.projectDir, filedir) : fileName,
              isDir: isDir,
              children: []
            }; // ?????? fileObj ?????????????????? ????????????????????????

            var dirArr = fileObj.children.filter(function (ele) {
              return ele.path === fileObj.path;
            }); // ???????????????

            if (dirArr.length === 1) {
              dirArr[0].children.push(_obj);
            } else {
              fileObj.children.push(_obj);
            }

            _this4.fileDisplay(_obj); // ????????????????????????????????????????????????????????????????????????

          }
        });
      }
      /**
       * ???????????????config
       * @param project ????????????
       * @returns
       */

    }, {
      key: "getInitConfig",
      value: function getInitConfig(project) {
        return {
          fileName: project.projectName,
          path: project.projectDir,
          sortPath: path__default["default"].relative(project.projectDir, project.projectDir),
          isDir: true,
          project: project,
          children: []
        };
      }
      /**
       * ????????????config
       * @returns
       */

    }, {
      key: "getTemplateConfig",
      value: function getTemplateConfig() {
        return {
          fileName: TEMPLATE_MODEL_NAME,
          path: TEMPLATE_DIR,
          sortPath: path__default["default"].relative(TEMPLATE_DIR, TEMPLATE_DIR),
          isDir: true,
          children: []
        };
      }
      /**
       * ????????????????????????
       */

    }, {
      key: "updateProjectConfig",
      value: function updateProjectConfig() {
        try {
          if (fs__default["default"].existsSync(this.configPath)) {
            var configJSON = this.getJsonFromPath(true);
            fs__default["default"].writeFileSync(this.configPath, JSON.stringify(configJSON));
            return configJSON;
          }
        } catch (error) {
          throw Error("updateProjectConfig throw error : " + error);
        }
      }
      /**
       * ??????????????????json ??????????????????????????????
       * @param jsonData ????????????json
       * @param key   ?????????
       * @param type ??????????????? ?????? ?????? ??????0 :????????? 1: ?????? 2?????????????????????
       */

    }, {
      key: "serachJSON",
      value: function serachJSON(jsonData, key, type) {
        var _this5 = this;

        // ??????????????????
        if (jsonData.isDir) {
          if (jsonData.fileName === key && type === 0) {
            this.keyPathArr.push({
              label: jsonData.sortPath,
              value: jsonData.path,
              children: jsonData.children
            });
          } // ?????????????????????, ????????????


          if (jsonData.children.length > 0) {
            jsonData.children.forEach(function (obj) {
              _this5.serachJSON(obj, key, type);
            });
          }
        } else {
          // ??????????????????
          if (type === 1 && jsonData.fileName === key) {
            this.keyPathArr.push({
              label: jsonData.sortPath,
              value: jsonData.path
            });
          }

          if (type === 2 && jsonData.fileName.includes(key)) {
            this.keyPathArr.push({
              label: jsonData.sortPath,
              value: jsonData.path
            });
          }
        }
      }
    }]);

    return TemplateTools;
  }();

  function page (project, params) {
    /**
     * ????????????????????????
     */
    if (params.model == undefined) {
      throw new Error("model ??????");
    }

    var pojo = tranformHumpStr(params.model.tableName);
    /**
     * ???????????????????????????template???????????????
     */

    var template = "\nimport { PlusOutlined } from '@ant-design/icons';\nimport { Button, message,  FormInstance, Space, Image, Typography } from 'antd';\nimport React, { useState, useRef, useEffect } from 'react';\nimport { PageContainer } from '@ant-design/pro-layout';\nimport type { ProColumns, ActionType } from '@ant-design/pro-table';\nimport ProTable from '@ant-design/pro-table';\nimport { BetaSchemaForm, ProFormColumnsType } from '@ant-design/pro-form';\nimport { findPage, add, update } from './api';\nimport type { ".concat(pojo, " } from './model';\n\nconst { Title, Paragraph } = Typography;\n/**\n * \u6DFB\u52A0\n *\n * @param fields\n */\n\nconst handleAdd = async (fields: ").concat(pojo, ") => {\n  const hide = message.loading('\u6B63\u5728\u6DFB\u52A0');\n\n  try {\n    await add({ ...fields });\n    hide();\n    message.success('\u6DFB\u52A0\u6210\u529F');\n    return true;\n  } catch (error) {\n    hide();\n    message.error('\u6DFB\u52A0\u5931\u8D25\u8BF7\u91CD\u8BD5\uFF01');\n    return false;\n  }\n};\n/**\n * \u66F4\u65B0\n *\n * @param fields\n */\n\nconst handleUpdate = async (fields: ").concat(pojo, ") => {\n  const hide = message.loading('\u6B63\u5728\u914D\u7F6E');\n\n  try {\n    await update(fields);\n    hide();\n    message.success('\u914D\u7F6E\u6210\u529F');\n    return true;\n  } catch (error) {\n    hide();\n    message.error('\u914D\u7F6E\u5931\u8D25\u8BF7\u91CD\u8BD5\uFF01');\n    return false;\n  }\n};\n\nconst TableList: React.FC = () => {\n  /** \u65B0\u5EFA\u7A97\u53E3\u7684\u5F39\u7A97 */\n  const [createModalVisible, handleModalVisible] = useState<boolean>(false);\n  /** \u5206\u5E03\u66F4\u65B0\u7A97\u53E3\u7684\u5F39\u7A97 */\n  const [updateModalVisible, handleUpdateModalVisible] = useState<boolean>(false);\n  const [showDetail, setShowDetail] = useState<boolean>(false);\n  const actionRef = useRef<ActionType>();\n  const updateRef = useRef<FormInstance>();\n  const [currentRow, setCurrentRow] = useState<").concat(pojo, ">();\n  const columns: ProFormColumnsType<").concat(pojo, ">[] = [\n    {\n      title: '\u5E8F\u53F7',\n      dataIndex: 'index',\n      valueType: 'indexBorder',\n    },\n    ").concat(params.model.tableCloums.map(function (ele) {
      return "\n    {\n      dataIndex: '".concat(ele.columnName, "',\n      title: '").concat(ele.columnComment, "',\n      width: 'm',\n      hideInTable: true,\n      hideInSearch: true,\n      formItemProps: {\n        rules: [\n          {\n            required: true,\n            message: '\u6B64\u9879\u4E3A\u5FC5\u586B\u9879',\n          },\n        ],\n      },\n    },");
    }).join("\r\n\t"), "\n    {\n      title: '\u64CD\u4F5C',\n      dataIndex: 'option',\n      valueType: 'option',\n      hideInDescriptions: true,\n      render: (_, record) => [\n        <a\n          key=\"edit\"\n          onClick={() => {\n            setCurrentRow(record);\n            handleUpdateModalVisible(true);\n          }}\n        >\n          \u7F16\u8F91\n        </a>\n      ],\n    },\n  ];\n  useEffect(() => {\n    updateRef.current?.setFieldsValue(currentRow);\n    return () => {\n\n    }\n  }, [currentRow])\n  return (\n    <PageContainer>\n      <ProTable<").concat(pojo, ">\n        headerTitle=\"\u67E5\u8BE2\u8868\u683C\"\n        actionRef={actionRef}\n        rowKey=\"id\"\n        search={{\n          labelWidth: 120,\n        }}\n        toolBarRender={() => [\n          <Button\n            type=\"primary\"\n            key=\"primary\"\n            onClick={() => {\n              setCurrentRow(undefined);\n              handleModalVisible(true);\n            }}\n          >\n            <PlusOutlined /> \u65B0\u5EFA\n          </Button>,\n        ]}\n        request={findPage}\n        columns={columns as ProColumns<").concat(pojo, ">[]}\n      />\n      <BetaSchemaForm<").concat(pojo, ">\n        title=\"\u65B0\u589E\"\n        layout=\"horizontal\"\n        visible={createModalVisible}\n        onVisibleChange={handleModalVisible}\n        layoutType='ModalForm'\n        onFinish={async (value) => {\n          const success = await handleAdd(value as ").concat(pojo, ");\n          if (success) {\n            handleModalVisible(false);\n            if (actionRef.current) {\n              setCurrentRow(undefined);\n              actionRef.current.reload();\n            }\n          }\n        }}\n        columns={columns}\n      />\n      <BetaSchemaForm<").concat(pojo, ">\n        title=\"\u7F16\u8F91\"\n        layout=\"horizontal\"\n        formRef={updateRef}\n        visible={updateModalVisible}\n        onVisibleChange={handleUpdateModalVisible}\n        layoutType='ModalForm'\n        onFinish={async (value) => {\n          value.id = currentRow?.id;\n          const success = await handleUpdate(value as ").concat(pojo, ");\n          if (success) {\n            setCurrentRow(undefined);\n            handleUpdateModalVisible(false);\n\n            if (actionRef.current) {\n              actionRef.current.reload();\n            }\n          }\n        }}\n        columns={columns}\n      />\n    </PageContainer>\n  );\n};\nexport default TableList;\n      ");
    fs__default["default"].writeFileSync(path__default["default"].join(params.releasePath, pojo + "/index.tsx"), template);
  }

  function model (project, params) {
    /**
     * ????????????????????????
     */
    if (params.model == undefined) {
      throw new Error("model ??????");
    }

    var pojo = tranformHumpStr(params.model.tableName);
    /**
     * ???????????????????????????template???????????????
     */

    var tableColArr = params.model.tableCloums;
    var template = "export interface ".concat(pojo, " {\n  ").concat(tableColArr.map(function (ele) {
      var type = ele.columnType;

      if (ele.columnType === "Long" || ele.columnType === "Integer" || ele.columnType === "Double" || ele.columnType === "Float" || ele.columnType === "BigDecimal") {
        type = "number";
      }

      if (ele.columnType === "Boolean") {
        type = "boolean";
      }

      if (ele.columnType === "String") {
        type = "string";
      }

      return ele.columnName + "?:" + type + ";";
    }).join("\r\n\t"), "\n}\n\nexport interface PageParams {\n  sorter?: string;\n  status?: string;\n  key?: number;\n  current?: number;\n  pageSize?: number;\n}\n        ");
    fs__default["default"].writeFileSync(path__default["default"].join(params.releasePath, pojo + "/model.d.ts"), template);
  }

  function api (project, params) {
    /**
     * ????????????????????????
     */
    if (params.model == undefined) {
      throw new Error("model ??????");
    }

    var pojo = tranformHumpStr(params.model.tableName);
    var pojoVariable = getParamVariableFormat(pojo);
    var template = "\n// @ts-ignore\n/* eslint-disable */\nimport { request } from 'umi';\nimport { ".concat(pojo, ", PageParams } from './model';\n\n/** \u5206\u9875\u67E5\u8BE2*/\nexport async function findPage(body: PageParams, options?: { [key: string]: any }) {\n  return request<API.PageList>('/api/").concat(pojoVariable, "/find").concat(pojo, "Page', {\n      method: 'POST',\n      requestType: 'json',\n      data: body,\n      ...(options || {}),\n  });\n}\n\n/** \u65B0\u589E */\nexport async function add(body: ").concat(pojo, ", options?: { [key: string]: any }) {\n  return request<API.ApiResult>('/api/").concat(pojoVariable, "/save").concat(pojo, "', {\n      method: 'POST',\n      headers: {\n      'Content-Type': 'application/json',\n      },\n      data: body,\n      ...(options || {}),\n  });\n}\n\n/** \u66F4\u65B0 */\nexport async function update(body: ").concat(pojo, ", options?: { [key: string]: any }) {\n  return request<API.ApiResult>('/api/").concat(pojoVariable, "/update").concat(pojo, "', {\n      method: 'POST',\n      headers: {\n      'Content-Type': 'application/json',\n      },\n      data: body,\n      ...(options || {}),\n  });\n}\n        ");
    fs__default["default"].writeFileSync(path__default["default"].join(params.releasePath, pojo + "/api.ts"), template);
  }

  var CodeGenerator = /*#__PURE__*/function () {
    function CodeGenerator(project) {
      _classCallCheck(this, CodeGenerator);

      if (project.type !== 2) {
        throw Error("?????????????????????");
      }

      this.project = project;
    }

    _createClass(CodeGenerator, [{
      key: "init",
      value: function init() {
        var tools = new TemplateTools(this.project);
        tools.init();
      }
    }, {
      key: "generatorPage",
      value: function generatorPage(params) {
        var _params$model;

        if ((_params$model = params.model) !== null && _params$model !== void 0 && _params$model.tableName) {
          var _params$model2;

          // ?????????CURD??????
          var dir = path__default["default"].join(params.releasePath, tranformHumpStr((_params$model2 = params.model) === null || _params$model2 === void 0 ? void 0 : _params$model2.tableName));

          if (!fs__default["default"].existsSync(dir)) {
            fs__default["default"].mkdirSync(dir);
          } // ??????????????????


          model(this.project, params); // ????????????

          api(this.project, params); // ????????????

          page(this.project, params);
        } else {
          throw Error("tableName????????????");
        }
      }
    }, {
      key: "updateProjectConfig",
      value: function updateProjectConfig() {
        var tools = new TemplateTools(this.project);
        return tools.updateProjectConfig();
      }
    }]);

    return CodeGenerator;
  }();

  return CodeGenerator;

}));
