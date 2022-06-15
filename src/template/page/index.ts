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
import { Button, message,  FormInstance, Space, Image, Typography } from 'antd';
import React, { useState, useRef, useEffect } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { BetaSchemaForm, ProFormColumnsType } from '@ant-design/pro-form';
import { findPage, add, update } from './api';
import type { ${pojo} } from './model';
import { Form } from 'antd/es';

const { Title, Paragraph } = Typography;
/**
 * 添加
 *
 * @param fields
 */

const handleAdd = async (fields: ${pojo}) => {
  const hide = message.loading('正在添加');

  try {
    await add({ ...fields });
    hide();
    message.success('添加成功');
    return true;
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
  const hide = message.loading('正在配置');

  try {
    await update(fields);
    hide();
    message.success('配置成功');
    return true;
  } catch (error) {
    hide();
    message.error('配置失败请重试！');
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
  const [updateRef] = Form.useForm();
  const [currentRow, setCurrentRow] = useState<${pojo}>();
  const columns: ProFormColumnsType<${pojo}>[] = [
    {
      title: '序号',
      dataIndex: 'index',
      valueType: 'indexBorder',
    },
    ${params.model.tableCloums
      .map((ele) => {
        return `
    {
      dataIndex: '${ele.columnName}',
      title: '${ele.columnComment}',
      width: 'm',
      hideInTable: true,
      hideInSearch: true,
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
      render: (_, record) => [
        <a
          key="edit"
          onClick={() => {
            setCurrentRow(record);
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
        columns={columns as ProColumns<${pojo}>[]}
      />
      <BetaSchemaForm<${pojo}>
        title="新增"
        layout="horizontal"
        visible={createModalVisible}
        onVisibleChange={handleModalVisible}
        layoutType='ModalForm'
        modalProps={{ destroyOnClose: true, maskClosable: false }}
        onFinish={async (value) => {
          const success = await handleAdd(value as ${pojo});
          if (success) {
            handleModalVisible(false);
            if (actionRef.current) {
              setCurrentRow(undefined);
              actionRef.current.reload();
            }
          }
        }}
        columns={columns}
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
        columns={columns}
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
