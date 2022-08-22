import { tranformHumpStr } from "../index";
import fs from "fs";
import path from "path";

export default function (
  project: CodeFaster.Project,
  params: CodeFaster.Params
) {
  /**
   * 检验参数是否正常
   */
  if (params.model == undefined) {
    throw new Error("model 必传");
  }
  const pojo = tranformHumpStr(params.model.tableName);
  /**
   * 根据传递的参数生成template需要的参数
   */

  const template = `
import { PlusOutlined } from '@ant-design/icons';
import { Button, message } from 'antd';
import React, { useState, useRef, useEffect } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { BetaSchemaForm } from '@ant-design/pro-form';
import { findPage, add, update } from './api';
import type { ${pojo} } from './model';
import { Form } from 'antd/es';

/**
 * 添加
 *
 * @param fields
 */

const handleAdd = async (fields: ${pojo}) => {
  const hide = message.loading('正在添加');

  try {
    const json = await add({ ...fields });
    hide();
    return json.success;
  } catch (error) {
    hide();
    message.error('添加失败请重试！');
    return false;
  }
};
/**
 * 更新
 *
 * @param fields
 */

const handleUpdate = async (fields: ${pojo}) => {
  const hide = message.loading('正在更新');

  try {
    const json = await update(fields);
    hide();
    return json.success;
  } catch (error) {
    hide();
    message.error('更新失败请重试！');
    return false;
  }
};

const TableList: React.FC = () => {
  /** 新建窗口的弹窗 */
  const [createModalVisible, handleModalVisible] = useState<boolean>(false);
  /** 分布更新窗口的弹窗 */
  const [updateModalVisible, handleUpdateModalVisible] = useState<boolean>(false);
  const [showDetail, setShowDetail] = useState<boolean>(false);
  const actionRef = useRef<ActionType>();
  const [addRef] = Form.useForm();
  const [updateRef] = Form.useForm();
  const [currentRow, setCurrentRow] = useState<${pojo}>();
  const columns: ProColumns<${pojo}>[] = [
    {
      title: '序号',
      dataIndex: 'index',
      valueType: 'indexBorder',
      width:'50px',
    },
    ${params.model.tableCloums
      .map((ele) => {
        return `
    {
      dataIndex: '${ele.columnName}',
      title: '${ele.columnComment}',
      hideInTable: false,
      hideInSearch: true,
      hideInForm: false,
      formItemProps: {
        rules: [
          {
            required: true,
            message: '此项为必填项',
          },
        ],
      },
    },`;
      })
      .join("\r\n\t")}
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      hideInDescriptions: true,
      width: '200px',
      render: (_, record) => [
        <a
          key="edit"
          onClick={() => {
            setCurrentRow(
              Object.fromEntries(
                Object.entries(record).map((e) => {
                  if ('number' === typeof e[1]) {
                    e[1] = e[1].toString();
                  }
                  return e;
                }),
              ),
            );
            handleUpdateModalVisible(true);
          }}
        >
          编辑
        </a>
      ],
    },
  ];
  useEffect(() => {
    if (updateModalVisible) updateRef.setFieldsValue(currentRow);
    return () => {

    }
  }, [currentRow])
  return (
    <PageContainer>
      <ProTable<${pojo}>
        headerTitle="查询表格"
        actionRef={actionRef}
        bordered
        rowKey="id"
        search={{
          labelWidth: 120,
        }}
        toolBarRender={() => [
          <Button
            type="primary"
            key="primary"
            onClick={() => {
              setCurrentRow(undefined);
              handleModalVisible(true);
            }}
          >
            <PlusOutlined /> 新建
          </Button>,
        ]}
        request={findPage}
        columns={columns}
      />
      <BetaSchemaForm<${pojo}>
        title="新增"
        layout="horizontal"
        visible={createModalVisible}
        onVisibleChange={handleModalVisible}
        layoutType='ModalForm'
        form={addRef}
        onFinish={async (value) => {
          const success = await handleAdd(value as ${pojo});
          if (success) {
            addRef.resetFields();
            handleModalVisible(false);
            if (actionRef.current) {
              setCurrentRow(undefined);
              actionRef.current.reload();
            }
          }
        }}
        columns={columns as any}
      />
      <BetaSchemaForm<${pojo}>
        title="编辑"
        layout="horizontal"
        form={updateRef}
        visible={updateModalVisible}
        onVisibleChange={handleUpdateModalVisible}
        layoutType='ModalForm'
        onFinish={async (value) => {
          value.id = currentRow?.id;
          const success = await handleUpdate(value as ${pojo});
          if (success) {
            setCurrentRow(undefined);
            handleUpdateModalVisible(false);

            if (actionRef.current) {
              actionRef.current.reload();
            }
          }
        }}
        columns={columns as any}
      />
    </PageContainer>
  );
};
export default TableList;
      `;
  fs.writeFileSync(
    path.join(params.releasePath, pojo + "/index.tsx"),
    template
  );
}
