# 车辆管理模块 H5 端开发计划

> 基于《用车管理需求规格说明书 V1.0》和《用车管理.md》API 文档整理
> 生成时间：2026-02-28

---

## 一、架构设计：两个独立应用入口

车辆维护模块与用车申请模块**完全隔离**，未来作为两个独立应用入口：

```
repair-mobile/src/
├── api/
│   ├── repair.js              # 维修工单 API（已有）
│   ├── vehicle.js             # 用车申请 API（已有，不动）
│   └── vehicleManage.js       # 【新增】车辆维护 API（独立文件）
├── router/
│   ├── index.js               # 现有路由（维修 + 用车申请，不动）
│   └── vehicleManage.js       # 【新增】车辆维护路由（独立文件）
├── views/
│   ├── repair/                # 维修模块（已有，不动）
│   ├── vehicle/               # 用车申请模块（已有，不动）
│   │   ├── RecordList.vue
│   │   ├── Apply.vue
│   │   ├── Detail.vue
│   │   ├── ApprovalList.vue
│   │   └── ApprovalDetail.vue
│   └── vehicleManage/         # 【新增】车辆维护模块（独立目录）
│       ├── Index.vue           # 车辆维护首页（功能入口导航）
│       ├── VehicleList.vue     # 车辆列表
│       ├── VehicleDetail.vue   # 车辆 查看/新增/编辑（三合一）
│       ├── ServiceProviderList.vue
│       ├── ServiceProviderDetail.vue
│       ├── ExpenseList.vue
│       ├── ExpenseDetail.vue
│       ├── ViolationList.vue
│       ├── ViolationDetail.vue
│       ├── AccidentList.vue
│       ├── AccidentDetail.vue
│       ├── InsuranceList.vue
│       ├── InsuranceDetail.vue
│       ├── RepairRecordList.vue
│       ├── RepairRecordDetail.vue
│       ├── MaintenanceList.vue
│       ├── MaintenanceDetail.vue
│       ├── InspectionList.vue
│       └── InspectionDetail.vue
```

**隔离原则**：
- `views/vehicle/` = 用车申请（员工日常用车流程）— **不改动**
- `views/vehicleManage/` = 车辆维护（车辆管理员维护车辆档案及各项记录）— **全新目录**
- `api/vehicle.js` = 用车申请相关接口 — **不改动**
- `api/vehicleManage.js` = 车辆维护相关接口 — **全新文件**
- `router/index.js` 中现有路由 — **不改动**，仅追加引入 `router/vehicleManage.js` 中导出的路由数组

---

## 二、现有模块（用车申请，不改动）

| 页面 | 文件 | 路由 |
|------|------|------|
| 用车记录列表 | `views/vehicle/RecordList.vue` | `/vehicles` |
| 申请用车 | `views/vehicle/Apply.vue` | `/vehicles/apply` |
| 用车详情 | `views/vehicle/Detail.vue` | `/vehicles/:id` |
| 审批列表 | `views/vehicle/ApprovalList.vue` | `/vehicles/approval` |
| 审批详情 | `views/vehicle/ApprovalDetail.vue` | `/vehicles/approval/:id` |

API 文件：`src/api/vehicle.js`（保持不变）

---

## 三、新增模块总览（车辆维护）

| 序号 | 模块名称 | 后端实体 | API 基础路径 | 优先级 |
|------|----------|----------|--------------|--------|
| 1 | 车辆信息维护 | Vehicle | `/api/repair/Vehicle/` | P0 |
| 2 | 服务商信息维护 | VehServiceProvider | `/api/repair/VehServiceProvider/` | P0 |
| 3 | 费用登记管理 | VehFee | `/api/repair/VehFee/` | P1 |
| 4 | 违章记录管理 | VehViolationRecord | `/api/repair/VehViolationRecord/` | P1 |
| 5 | 事故处理管理 | VehAccident | `/api/repair/VehAccident/` | P1 |
| 6 | 保险信息管理 | VehInsuranceRecord | `/api/repair/VehInsuranceRecord/` | P1 |
| 7 | 维修记录管理 | VehRepair | `/api/repair/VehRepair/` | P2 |
| 8 | 保养记录管理 | VehMaintenance | `/api/repair/VehMaintenance/` | P2 |
| 9 | 年检合规管理 | VehInspection | `/api/repair/VehInspection/` | P2 |

> P0 = 基础数据（其他模块依赖）；P1 = 核心业务；P2 = 扩展功能

---

## 四、新增文件清单

### 4.1 API 文件：`src/api/vehicleManage.js`

```js
// 所有车辆维护模块的 API 统一放在此文件
// 与 api/vehicle.js（用车申请）完全隔离

// ── 车辆档案 CRUD ──
getVehicleMngList / createVehicleMng / updateVehicleMng / deleteVehicleMng / getVehicleMngDetail

// ── 服务商 CRUD ──
getServiceProviderList / createServiceProvider / updateServiceProvider / deleteServiceProvider / getServiceProviderDetail

// ── 费用登记 CRUD ──
getExpenseMngList / createExpenseMng / updateExpenseMng / deleteExpenseMng / getExpenseMngDetail

// ── 违章记录 CRUD ──
getViolationList / createViolation / updateViolation / deleteViolation / getViolationDetail

// ── 事故处理 CRUD ──
getAccidentList / createAccident / updateAccident / deleteAccident / getAccidentDetail

// ── 保险信息 CRUD ──
getInsuranceList / createInsurance / updateInsurance / deleteInsurance / getInsuranceDetail

// ── 维修记录 CRUD ──
getRepairRecordList / createRepairRecord / updateRepairRecord / deleteRepairRecord / getRepairRecordDetail

// ── 保养记录 CRUD ──
getMaintenanceList / createMaintenance / updateMaintenance / deleteMaintenance / getMaintenanceDetail

// ── 年检合规 CRUD ──
getInspectionList / createInspection / updateInspection / deleteInspection / getInspectionDetail
```

### 4.2 路由文件：`src/router/vehicleManage.js`

独立导出路由数组，在 `router/index.js` 中通过扩展运算符合并：

```js
// router/vehicleManage.js
export const vehicleManageRoutes = [
  // 车辆维护首页（功能入口导航）
  { path: '/vm',                              component: Index },

  // 车辆信息维护
  { path: '/vm/vehicles',                     component: VehicleList },
  { path: '/vm/vehicles/create',              component: VehicleDetail },  // mode=create
  { path: '/vm/vehicles/:id',                 component: VehicleDetail },  // mode=view（默认）
  { path: '/vm/vehicles/:id/edit',            component: VehicleDetail },  // mode=edit

  // 服务商信息维护
  { path: '/vm/service-providers',            component: ServiceProviderList },
  { path: '/vm/service-providers/create',     component: ServiceProviderDetail },
  { path: '/vm/service-providers/:id',        component: ServiceProviderDetail },
  { path: '/vm/service-providers/:id/edit',   component: ServiceProviderDetail },

  // 费用登记管理
  { path: '/vm/expenses',                     component: ExpenseList },
  { path: '/vm/expenses/create',              component: ExpenseDetail },
  { path: '/vm/expenses/:id',                 component: ExpenseDetail },
  { path: '/vm/expenses/:id/edit',            component: ExpenseDetail },

  // 违章记录管理
  { path: '/vm/violations',                   component: ViolationList },
  { path: '/vm/violations/create',            component: ViolationDetail },
  { path: '/vm/violations/:id',               component: ViolationDetail },
  { path: '/vm/violations/:id/edit',          component: ViolationDetail },

  // 事故处理管理
  { path: '/vm/accidents',                    component: AccidentList },
  { path: '/vm/accidents/create',             component: AccidentDetail },
  { path: '/vm/accidents/:id',                component: AccidentDetail },
  { path: '/vm/accidents/:id/edit',           component: AccidentDetail },

  // 保险信息管理
  { path: '/vm/insurances',                   component: InsuranceList },
  { path: '/vm/insurances/create',            component: InsuranceDetail },
  { path: '/vm/insurances/:id',               component: InsuranceDetail },
  { path: '/vm/insurances/:id/edit',          component: InsuranceDetail },

  // 维修记录管理
  { path: '/vm/repair-records',               component: RepairRecordList },
  { path: '/vm/repair-records/create',        component: RepairRecordDetail },
  { path: '/vm/repair-records/:id',           component: RepairRecordDetail },
  { path: '/vm/repair-records/:id/edit',      component: RepairRecordDetail },

  // 保养记录管理
  { path: '/vm/maintenances',                 component: MaintenanceList },
  { path: '/vm/maintenances/create',          component: MaintenanceDetail },
  { path: '/vm/maintenances/:id',             component: MaintenanceDetail },
  { path: '/vm/maintenances/:id/edit',        component: MaintenanceDetail },

  // 年检合规管理
  { path: '/vm/inspections',                  component: InspectionList },
  { path: '/vm/inspections/create',           component: InspectionDetail },
  { path: '/vm/inspections/:id',              component: InspectionDetail },
  { path: '/vm/inspections/:id/edit',         component: InspectionDetail },
]
```

路由统一使用 `/vm/` 前缀（Vehicle Manage），与现有 `/vehicles/`（用车申请）区分。

每个模块的 Detail 页面通过路由路径自动判断模式：
- `/create` → 新增模式（表单空白，提交调创建接口）
- `/:id` → 查看模式（只读展示，底部有编辑/删除按钮）
- `/:id/edit` → 编辑模式（表单预填，提交调更新接口）

### 4.3 路由合并方式

```js
// router/index.js 中追加
import { vehicleManageRoutes } from './vehicleManage'

const routes = [
  // ... 现有路由保持不动 ...
  ...vehicleManageRoutes
]
```

### 4.4 页面文件：`src/views/vehicleManage/`

每个模块只有 **List（列表）+ Detail（详情/新增/编辑三合一）** 两个页面。

Detail 页面通过路由自动判断模式：

```js
// 每个 Detail.vue 内部的模式判断逻辑
const route = useRoute()
const isCreate = computed(() => route.path.endsWith('/create'))
const isEdit = computed(() => route.path.endsWith('/edit'))
const isView = computed(() => !isCreate.value && !isEdit.value)
const mode = computed(() => isCreate.value ? 'create' : isEdit.value ? 'edit' : 'view')
```

- **view 模式**：`van-cell-group` 只读展示，底部显示「编辑」「删除」按钮
- **create / edit 模式**：`van-form` + `van-field` 表单，底部显示「提交」按钮
- 编辑模式自动加载详情数据填充表单

| 序号 | 模块 | 文件名 | 说明 |
|------|------|--------|------|
| 0 | 首页 | `Index.vue` | 宫格导航 |
| 1 | 车辆信息 | `VehicleList.vue` | 列表 + 搜索 + 筛选 |
| 2 | 车辆信息 | `VehicleDetail.vue` | 查看 / 新增 / 编辑 |
| 3 | 服务商 | `ServiceProviderList.vue` | 列表 + Tab筛选 |
| 4 | 服务商 | `ServiceProviderDetail.vue` | 查看 / 新增 / 编辑 |
| 5 | 费用登记 | `ExpenseList.vue` | 列表 + Tab筛选 |
| 6 | 费用登记 | `ExpenseDetail.vue` | 查看 / 新增 / 编辑 |
| 7 | 违章记录 | `ViolationList.vue` | 列表 + Tab筛选 |
| 8 | 违章记录 | `ViolationDetail.vue` | 查看 / 新增 / 编辑 |
| 9 | 事故处理 | `AccidentList.vue` | 列表 + Tab筛选 |
| 10 | 事故处理 | `AccidentDetail.vue` | 查看 / 新增 / 编辑 |
| 11 | 保险信息 | `InsuranceList.vue` | 列表 |
| 12 | 保险信息 | `InsuranceDetail.vue` | 查看 / 新增 / 编辑 |
| 13 | 维修记录 | `RepairRecordList.vue` | 列表 |
| 14 | 维修记录 | `RepairRecordDetail.vue` | 查看 / 新增 / 编辑 |
| 15 | 保养记录 | `MaintenanceList.vue` | 列表 |
| 16 | 保养记录 | `MaintenanceDetail.vue` | 查看 / 新增 / 编辑 |
| 17 | 年检合规 | `InspectionList.vue` | 列表 |
| 18 | 年检合规 | `InspectionDetail.vue` | 查看 / 新增 / 编辑 |

共计 **19 个新页面**（含首页），全部在 `src/views/vehicleManage/` 目录下。

---

## 五、车辆维护首页（Index.vue）

作为车辆维护应用的独立入口，宫格导航到各子模块：

```
路由：/vm
布局：van-nav-bar 顶部 + van-grid 宫格

┌─────────────┬─────────────┬─────────────┐
│  车辆信息    │  服务商管理  │  费用登记    │
│  /vm/vehicles│ /vm/service │ /vm/expenses │
├─────────────┼─────────────┼─────────────┤
│  违章记录    │  事故处理    │  保险信息    │
│ /vm/violations│/vm/accidents│/vm/insurances│
├─────────────┼─────────────┼─────────────┤
│  维修记录    │  保养记录    │  年检合规    │
│/vm/repair-*  │/vm/maintain* │/vm/inspect*  │
└─────────────┴─────────────┴─────────────┘
```

---

## 六、各模块功能点详细说明

### 模块 1：车辆信息维护

**页面**：VehicleList + VehicleDetail（查看/新增/编辑三合一）

**VehicleList 列表页**
- 搜索栏：车牌号模糊搜索
- 筛选：车辆类型（轿车/SUV/货车）、车辆状态（可用/维修中/报废）
- 卡片展示：车牌号、类型、颜色、状态标签
- 下拉刷新 + 无限滚动分页
- 点击进入详情（view），右上角"+"新增（create）

**VehicleDetail 三合一页**
- **view 模式**（`/vm/vehicles/:id`）：
  - 基础信息卡片：车牌号、类型、颜色、油箱容积、发动机号、车架号、核定吨位/人数
  - 所属信息卡片：所有人类型（个人/企业）、对应子字段
  - 联系信息卡片：联系电话
  - 车辆照片：图片预览
  - 底部按钮：「编辑」→跳转 edit 模式、「删除」→二次确认
- **create 模式**（`/vm/vehicles/create`）/ **edit 模式**（`/vm/vehicles/:id/edit`）：
  - 车牌号（必填，格式校验，唯一性）
  - 车辆类型（下拉选择）
  - 颜色（下拉选择）
  - 油箱容积、发动机号、车架号、核定吨位、核定人数
  - 车辆所属（单选联动：个人→车主姓名/身份证；企业→企业名称/信用代码）
  - 联系电话（手机号校验）
  - 车辆照片（van-uploader 多图上传，≤5M）
  - 机构选择、车辆状态（下拉）、备注
  - 底部按钮：「提交」

**API**

| 操作 | 方法 | 路径 |
|------|------|------|
| 列表 | POST | `/api/repair/Vehicle/getList` |
| 创建 | POST | `/api/repair/Vehicle` |
| 更新 | POST | `/api/repair/Vehicle/update/{id}` |
| 删除 | GET | `/api/repair/Vehicle/delete/{id}` |
| 详情 | GET | `/api/repair/Vehicle/detail/{id}` |

---

### 模块 2：服务商信息维护

**页面**：ServiceProviderList + ServiceProviderDetail（三合一）

**ServiceProviderList 列表页**
- Tab 筛选：全部 / 维修厂 / 保险公司
- 搜索：名称模糊搜索
- 卡片：名称、类型标签、联系人、电话

**ServiceProviderDetail 三合一页**
- **view 模式**：各字段只读展示；底部「编辑」「删除」
- **create / edit 模式**：
  - 服务商编号 `providerNo`（自动或手动）
  - 服务商名称 `providerName`（必填）
  - 服务商类型 `providerType`（下拉：维修厂/保险公司）
  - 联系人 `contactPerson`（必填）
  - 联系电话 `contactPhone`（必填）
  - 合作有效期 `cooperationValidity`（日期选择）
  - 描述 `description`
  - 备注 `remark`

**API**

| 操作 | 方法 | 路径 |
|------|------|------|
| 列表 | POST | `/api/repair/VehServiceProvider/getList` |
| 创建 | POST | `/api/repair/VehServiceProvider` |
| 更新 | PUT | `/api/repair/VehServiceProvider/{id}` |
| 删除 | DELETE | `/api/repair/VehServiceProvider/{id}` |
| 详情 | GET | `/api/repair/VehServiceProvider/detail/{id}` |

---

### 模块 3：费用登记管理

**页面**：ExpenseList + ExpenseDetail（三合一）

**ExpenseList 列表页**
- Tab 筛选：全部 / 路桥费 / 停车费 / 杂费
- 卡片：车牌号、费用类型标签、金额、发生时间

**ExpenseDetail 三合一页**
- **view 模式**：各字段只读展示；底部「编辑」「删除」
- **create / edit 模式**：
  - 关联车辆 `vehicleId`（选择器）
  - 费用类型（下拉：路桥费/停车费/杂费）
  - 费用金额（必填，2位小数）
  - 费用发生时间（必填）
  - 费用发生地点
  - 支付方式（下拉）
  - 票据编号
  - 票据文件（多图上传，最多3张，≤5M）
  - 费用说明

**API**

| 操作 | 方法 | 路径 |
|------|------|------|
| 列表 | POST | `/api/repair/VehFee/getList` |
| 创建 | POST | `/api/repair/VehFee` |
| 更新 | POST | `/api/repair/VehFee/update/{id}` |
| 删除 | GET | `/api/repair/VehFee/delete/{id}` |
| 详情 | GET | `/api/repair/VehFee/detail/{id}` |

---

### 模块 4：违章记录管理

**页面**：ViolationList + ViolationDetail（三合一）

**ViolationList 列表页**
- Tab 筛选：全部 / 未处理 / 处理中 / 已处理 / 已逾期
- 卡片：车牌号、违章类型、罚款金额、扣分、状态标签

**ViolationDetail 三合一页**
- **view 模式**：各字段只读展示；底部「编辑」「删除」
- **create / edit 模式**：
  - 关联车辆 `vehicleId`（选择器）
  - 违章驾驶人
  - 违章编号
  - 违章类型（下拉：闯红灯/超速/违停等）
  - 违章发生时间（必填）、地点
  - 违章描述
  - 处罚类型（多选：罚款/扣分/警告）
  - 罚款金额（必填，默认0）
  - 扣分分值（必填，0-12，默认0）
  - 处罚机关
  - 违章状态（下拉）
  - 处理人、处理时间
  - 缴纳方式（下拉）
  - 违章罚单/凭证（多图上传，≤5M）
  - 备注

**API**

| 操作 | 方法 | 路径 |
|------|------|------|
| 列表 | POST | `/api/repair/VehViolationRecord/getList` |
| 创建 | POST | `/api/repair/VehViolationRecord` |
| 更新 | PUT | `/api/repair/VehViolationRecord/{id}` |
| 删除 | DELETE | `/api/repair/VehViolationRecord/{id}` |
| 详情 | GET | `/api/repair/VehViolationRecord/detail/{id}` |

---

### 模块 5：事故处理管理

**页面**：AccidentList + AccidentDetail（三合一）

**AccidentList 列表页**
- Tab 筛选：全部 / 未处理 / 处理中 / 已结案 / 协商中
- 卡片：车牌号、事故类型、等级标签、状态

**AccidentDetail 三合一页**
- **view 模式**：各字段只读展示；底部「编辑」「删除」
- **create / edit 模式**：
  - 关联车辆 `vehicleId`（选择器）
  - 事故驾驶人（必填）
  - 事故编号（自动生成：年月+流水号）
  - 事故类型（下拉：追尾/剐蹭/碰撞/翻车/单方/多方）
  - 事故发生时间（必填）、地点（必填）
  - 事故描述（必填）
  - 事故等级（下拉：轻微/一般/重大）
  - 事故造成损失（多选）
  - 责任划分（下拉：全责/主责/次责/同等/无责）
  - 责任认定书编号、认定机关
  - 事故状态（下拉）
  - 处理人、处理时间、处理方式（多选）、处理结果说明
  - 关联保险记录（选择器）、理赔金额、理赔状态
  - 事故相关文件（多图上传，最多5张）
  - 备注

**API**

| 操作 | 方法 | 路径 |
|------|------|------|
| 列表 | POST | `/api/repair/VehAccident/getList` |
| 创建 | POST | `/api/repair/VehAccident` |
| 更新 | POST | `/api/repair/VehAccident/update/{id}` |
| 删除 | GET | `/api/repair/VehAccident/delete/{id}` |
| 详情 | GET | `/api/repair/VehAccident/detail/{id}` |

---

### 模块 6：保险信息管理

**页面**：InsuranceList + InsuranceDetail（三合一）

**InsuranceList 列表页**
- 卡片：车牌号、保险公司、保险类型、到期时间

**InsuranceDetail 三合一页**
- **view 模式**：各字段只读展示；底部「编辑」「删除」
- **create / edit 模式**：
  - 关联车辆 `vehicleId`（选择器）
  - 保险类型 `insuranceType`（下拉：交强险/商业险/第三者责任险等）
  - 保单号 `insurancePolicyNo`
  - 保费金额 `premium`（数字，2位小数）
  - 投保日期 `insureDate`（必填）
  - 到期日期 `insuranceExpireDate`（必填）
  - 保险公司 `insuranceCompany`
  - 保险联系人 `insuranceContact`
  - 保险联系电话 `insurancePhone`
  - 关联服务商 `serviceProviderId`（选择器，类型=保险公司）
  - 保险状态 `insuranceStatus`（下拉）
  - 保单附件 `policyFiles`（多图上传）
  - 备注 `remark`

**API**

| 操作 | 方法 | 路径 |
|------|------|------|
| 列表 | POST | `/api/repair/VehInsuranceRecord/getList` |
| 创建 | POST | `/api/repair/VehInsuranceRecord` |
| 更新 | PUT | `/api/repair/VehInsuranceRecord/{id}` |
| 删除 | DELETE | `/api/repair/VehInsuranceRecord/{id}` |
| 详情 | GET | `/api/repair/VehInsuranceRecord/detail/{id}` |

---

### 模块 7：维修记录管理

**页面**：RepairRecordList + RepairRecordDetail（三合一）

**RepairRecordList 列表页**
- 卡片：车牌号、维修类型、维修机构、时间、验收结果标签

**RepairRecordDetail 三合一页**
- **view 模式**：各字段只读展示；底部「编辑」「删除」
- **create / edit 模式**：
  - 关联车辆、维修负责人
  - 维修记录编号（自动生成）
  - 维修类型（下拉：故障维修/事故维修/定期检修/配件更换/系统升级）
  - 维修级别（下拉：小修/中修/大修/专项维修）
  - 维修机构（关联服务商，类型=维修厂）
  - 维修开始/结束时间、维修时里程数
  - 故障描述（必填）、故障原因诊断
  - 维修项目（多选）、更换配件明细
  - 材料费、工时费、总费用、支付方式
  - 维修验收结果（合格/基本合格/不合格）、验收人
  - 维修相关文件（多图上传，最多5张）
  - 备注

**API**

| 操作 | 方法 | 路径 |
|------|------|------|
| 列表 | POST | `/api/repair/VehRepair/getList` |
| 创建 | POST | `/api/repair/VehRepair` |
| 更新 | POST | `/api/repair/VehRepair/update/{id}` |
| 删除 | GET | `/api/repair/VehRepair/delete/{id}` |
| 详情 | GET | `/api/repair/VehRepair/detail/{id}` |

---

### 模块 8：保养记录管理

**页面**：MaintenanceList + MaintenanceDetail（三合一）

**MaintenanceList 列表页**
- 卡片：车牌号、保养类型/级别、保养机构、时间

**MaintenanceDetail 三合一页**
- **view 模式**：各字段只读展示；底部「编辑」「删除」
- **create / edit 模式**：
  - 关联车辆、保养负责人
  - 保养记录编号（自动生成）
  - 保养类型（下拉：常规/专项/应急/换季）
  - 保养级别（下拉：一级/二级/三级）
  - 保养机构（关联服务商，类型=维修厂）
  - 保养开始/结束时间、保养时里程数
  - 保养项目（多选：机油更换/滤芯/轮胎换位/制动检查/电瓶检测等）
  - 更换配件明细、保养发现问题
  - 材料费、工时费、总费用、支付方式
  - 保养验收结果、验收人
  - 保养相关文件（多图上传，最多4张）
  - 备注

**API**

| 操作 | 方法 | 路径 |
|------|------|------|
| 列表 | POST | `/api/repair/VehMaintenance/getList` |
| 创建 | POST | `/api/repair/VehMaintenance` |
| 更新 | POST | `/api/repair/VehMaintenance/update/{id}` |
| 删除 | GET | `/api/repair/VehMaintenance/delete/{id}` |
| 详情 | GET | `/api/repair/VehMaintenance/detail/{id}` |

---

### 模块 9：年检合规管理

**页面**：InspectionList + InspectionDetail（三合一）

**InspectionList 列表页**
- 卡片：车牌号、检验日期、有效期至

**InspectionDetail 三合一页**
- **view 模式**：各字段只读展示；底部「编辑」「删除」
- **create / edit 模式**：
  - 关联车辆（选择器）
  - 检验日期（必填）、有效期至（必填）
  - 检验机构
  - 检验结果（合格/不合格）
  - 检验费用
  - 年检附件（多图上传）
  - 备注

**API**

| 操作 | 方法 | 路径 |
|------|------|------|
| 列表 | POST | `/api/repair/VehInspection/getList` |
| 创建 | POST | `/api/repair/VehInspection` |
| 更新 | POST | `/api/repair/VehInspection/update/{id}` |
| 删除 | GET | `/api/repair/VehInspection/delete/{id}` |
| 详情 | GET | `/api/repair/VehInspection/detail/{id}` |

---

## 七、公共组件（可选抽取）

各模块页面结构高度一致，可在 `src/components/` 下抽取公共组件：

| 组件 | 说明 | 使用模块 |
|------|------|----------|
| VehiclePicker | 车辆选择器弹窗（车牌号搜索） | 费用/违章/事故/保险/维修/保养/年检 |
| ServiceProviderPicker | 服务商选择器弹窗（按类型过滤） | 维修/保养/保险 |
| FileUploader | 统一文件上传组件（封装 van-uploader） | 全部模块 |
| formatTime | 时间格式化工具（已支持数组+时间戳） | 全部模块（移到 utils） |

---

## 八、开发顺序

```
第一批（P0 基础数据 + 基础设施）
  ├── 0. 创建 api/vehicleManage.js、router/vehicleManage.js、views/vehicleManage/ 目录
  ├── 1. 车辆维护首页 Index.vue（宫格导航）
  ├── 2. 车辆信息维护（2 页面：List + Detail 三合一）
  └── 3. 服务商信息维护（2 页面：List + Detail 三合一）

第二批（P1 核心业务）
  ├── 4. 费用登记管理（2 页面）
  ├── 5. 违章记录管理（2 页面）
  ├── 6. 事故处理管理（2 页面）
  └── 7. 保险信息管理（2 页面）

第三批（P2 扩展功能）
  ├── 8. 维修记录管理（2 页面）
  ├── 9. 保养记录管理（2 页面）
  └── 10. 年检合规管理（2 页面）
```

---

## 九、注意事项

1. **完全隔离**：车辆维护的 views、api、router 全部独立，不修改现有用车申请模块的任何文件
2. **路由前缀**：车辆维护统一使用 `/vm/` 前缀，用车申请保持 `/vehicles/`
3. **功能范围**：只做基本信息的增删改查（CRUD），不做到期提醒、预警通知等扩展功能
4. **样式一致**：整体页面样式与当前项目保持一致（卡片圆角、配色、字号、间距等复用现有 CSS 风格）
5. **列表分页**：所有列表页使用 `van-pull-refresh` + `van-list` 实现下拉刷新和上滑加载更多（无限滚动分页）
6. **API 路径**：文档中为 `/mobile/repair/...`，实际使用 `/api/repair/...`（vite proxy 转发）
7. **JNPF 双字段**：后端返回含 `_jnpfId` 后缀字段（原始值）和展示字段，前端展示用不带后缀的字段，提交表单时传 `_jnpfId` 字段值
8. **文件上传**：复用 `uploadFile`（`POST /api/file/Uploader/:type`），可从 `api/repair.js` 导入
9. **删除确认**：所有删除操作使用 `van-dialog` 二次确认
10. **共享工具**：`formatTime` 等工具函数可从 `utils/` 引入，避免重复定义
