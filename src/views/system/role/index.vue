<template>
  <div>
    <el-card class="container-card" shadow="always">
      <el-form size="mini" :inline="true" :model="params" class="demo-form-inline">
        <el-form-item label="角色名称">
          <el-input v-model.trim="params.name" clearable placeholder="角色名称" @clear="search" />
        </el-form-item>
        <el-form-item label="权限字符">
          <el-input v-model.trim="params.roleKey" clearable placeholder="权限字符" @clear="search" />
        </el-form-item>
        <el-form-item label="角色状态">
          <el-select v-model.trim="params.status" clearable placeholder="角色状态" @change="search" @clear="search">
            <el-option
              v-for="dict in statusOptions"
              :key="dict.dictValue"
              :label="dict.dictLabel"
              :value="dict.dictValue"
             />
          </el-select> 
        </el-form-item>
        <el-form-item>
          <el-button :loading="loading" icon="el-icon-search" type="primary" @click="search">查询</el-button>
        </el-form-item>
        <el-form-item>
          <el-button  v-permisaction="['systeam:role:add']" :loading="loading" icon="el-icon-plus" type="warning" @click="create">新增</el-button>
        </el-form-item>
        <el-form-item>
          <el-button v-permisaction="['systeam:role:delete']" :disabled="multipleSelection.length === 0" :loading="loading" icon="el-icon-delete" type="danger" @click="batchDelete">批量删除</el-button>
        </el-form-item>
      </el-form>

      <el-table v-loading="loading" :data="tableData" border stripe style="width: 100%" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="角色编号" prop="roleId" width="120"/>
        <el-table-column label="角色名称" prop="name" :show-overflow-tooltip="true" width="120"/>
        <el-table-column label="权限字符" prop="roleKey" :show-overflow-tooltip="true" width="120"/>
        <el-table-column label="显示顺序" prop="sort" width="100" /> 
        <el-table-column prop="status" label="角色状态" align="center"> 
          <template slot-scope="scope">
          <el-switch  v-if="scope.row.roleId !==1"
            v-model="scope.row.status"
               :active-value="2"
               :inactive-value="1"
            @change="handleStatusChange(scope.row)"
          ></el-switch>
        </template>
        </el-table-column>  
        <el-table-column align="center" prop="remark" label="备注" />
        <el-table-column fixed="right" label="操作" align="center" width="140">
          <template slot-scope="scope">
            <el-tooltip content="编辑" effect="dark" placement="top" v-if="scope.row.roleId !==1">
              <el-button v-permisaction="['systeam:role:edit']" size="mini" icon="el-icon-edit" circle type="primary" @click="update(scope.row)" />
            </el-tooltip>
            <el-tooltip content="权限" effect="dark" placement="top">
              <el-button v-permisaction="['systeam:role:menusEdit']" size="mini" icon="el-icon-key" circle type="warning" @click="updatePermission(scope.row.roleId)" />
            </el-tooltip>
            <el-tooltip content="删除" effect="dark" placement="top" v-if="scope.row.roleId !==1">
              <el-popconfirm style="margin-left:10px" title="确定删除吗？" @onConfirm="singleDelete(scope.row.roleId)">
                <el-button v-permisaction="['systeam:role:edit']" slot="reference" size="mini" icon="el-icon-delete" circle type="danger" />
              </el-popconfirm>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        :current-page="params.pageNum"
        :page-size="params.pageSize"
        :total="total"
        :page-sizes="[1, 5, 10, 30]"
        layout="total, prev, pager, next, sizes"
        background
        style="margin-top: 10px;float:right;margin-bottom: 10px;"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />

      <el-dialog :title="dialogFormTitle" :visible.sync="dialogFormVisible" width="580px">
        <el-form ref="dialogForm" :inline="true" size="small" :model="dialogFormData" :rules="dialogFormRules" label-width="100px">
          <el-form-item label="角色名称" prop="name">
            <el-input v-model.trim="dialogFormData.name" placeholder="角色名称" style="width: 420px" />
          </el-form-item>
          <el-form-item label="权限字符" prop="roleKey">
            <el-input v-model.trim="dialogFormData.roleKey" :disabled="isEdit" placeholder="权限字符" style="width: 420px" />
          </el-form-item>
          <el-form-item label="角色状态" prop="status"> 
            <el-radio-group v-model="dialogFormData.status">
              <el-radio
                v-for="dict in statusOptions"
                :key="dict.dictValue"
                :label="dict.dictValue"
              >{{dict.dictLabel}}</el-radio>
          </el-radio-group>
          </el-form-item>
          <el-form-item label="角色排序" prop="sort">
            <el-input-number v-model.number="dialogFormData.sort" controls-position="right" 
            :min="1" :max="999" />
          </el-form-item>
          <el-form-item label="备注" prop="remark">
            <el-input v-model.trim="dialogFormData.remark" style="width: 420px" type="textarea"
             placeholder="备注" show-word-limit maxlength="100" />
          </el-form-item>
        </el-form>
        <div slot="footer">
          <el-button size="mini" @click="cancelForm()">取 消</el-button>
          <el-button size="mini" :loading="submitLoading" type="primary" @click="submitForm()">确 定</el-button>
        </div>
      </el-dialog>

      <el-dialog title="修改权限" :visible.sync="permsDialogVisible" width="580px" custom-class="perms-dialog">
        <el-tabs>
          <el-tab-pane>
            <span slot="label"><svg-icon icon-class="menu1" class-name="role-menu" /> 角色菜单</span>
            <el-tree
              ref="roleMenuTree"
              v-loading="menuTreeLoading"
              :props="{children: 'children',label: 'title'}"
              :data="menuTree"
              show-checkbox
              node-key="menuId"  
              :default-checked-keys="defaultCheckedRoleMenu"
            />   <!---- check-strictly--->

          </el-tab-pane> 
          <el-tab-pane>
            <span slot="label"><svg-icon icon-class="api1" class-name="role-menu" /> 角色接口</span>
            <el-tree
              ref="roleApiTree"
              v-loading="apiTreeLoading"
              :props="{children: 'children',label: 'title'}"
              :data="apiTree"
              show-checkbox
              node-key="apiId"
              :default-checked-keys="defaultCheckedRoleApi"
            />

          </el-tab-pane>
        </el-tabs>
        <div slot="footer">
          <el-button size="mini" :loading="permissionLoading" @click="cancelPermissionForm()">取 消</el-button>
          <el-button size="mini" type="primary" @click="submitPermissionForm()">确 定</el-button>
        </div>
      </el-dialog>

    </el-card>
  </div>
</template>

<script>
import { getRoles,changeRoleStatus, createRole, updateRoleById, batchDeleteRoleByIds, getRoleMenusById, getRoleApisById, updateRoleMenusById, updateRoleApisById } from '@/api/system/role'
import { getMenuTree } from '@/api/system/menu'
import { getApiTree } from '@/api/system/api'

export default {
  name: 'Role',
  data() {
    return {
      // 查询参数
      params: {
        name: '',
        roleKey: '',
        status: undefined,
        pageNum: 1,
        pageSize: 10
      },
      // 表格数据
      tableData: [],
      total: 0,
      loading: false,

      // dialog对话框
      submitLoading: false,
      dialogFormTitle: '',
      dialogType: '',
      dialogFormVisible: false,
      dialogFormData: {
        roleId:undefined,
        name: undefined,
        roleKey: undefined ,
        status: '2',
        pid: 0,
        sort: 10,
        remark: undefined
      },
      dialogFormRules: {
        name: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 1, max: 20, message: '长度在 1 到 20 个字符', trigger: 'blur' }
        ],
        roleKey: [
          { required: true, message: '请输入权限字符', trigger: 'blur' },
          { min: 1, max: 20, message: '长度在 1 到 20 个字符', trigger: 'blur' }
        ],
        status: [
          { required: true, message: '请选择角色状态', trigger: 'change' }
        ],
        remark: [
          { required: false, message: '说明', trigger: 'blur' },
          { min: 0, max: 100, message: '长度在 0 到 100 个字符', trigger: 'blur' }
        ]
      },
      
      // 删除按钮弹出框
      popoverVisible: false,
      // 表格多选
      multipleSelection: [],
      // 状态数据字典
      statusOptions: [],
      // 数据范围选项
      dataScopeOptions: [],
      isEdit: false,
      // 修改权限
      permsDialogVisible: false,
      permissionLoading: false,
      menuTree: [],
      defaultCheckedRoleMenu: [],
      apiTree: [],
      defaultCheckedRoleApi: [],

      // 被修改权限的角色ID
      roleId: 0
    }
  },
  created() {
    this.getDicts("sys_normal_disable").then(response => {
      this.statusOptions = response.data;
    });
    this.getDicts("sys_data_scope").then(response => {
      this.dataScopeOptions = response.data;
    });

    this.getTableData()
    this.getMenuTree()
    this.getApiTree()
  },
  methods: {
    // 查询
    search() {
      this.params.pageNum = 1
      this.getTableData()
    },

    // 获取表格数据
    async getTableData() {
      this.loading = true
      try {
        const { data } = await getRoles(this.params)
        this.tableData = data.list
        this.total = data.count
      } finally {
        this.loading = false
      }
    },

    // 新增
    create() {
      this.dialogFormTitle = '新增角色'
      this.dialogType = 'create'
      this.dialogFormVisible = true
      this.isEdit = false
    },

    // 修改
    update(row) {
      this.dialogFormData.roleId = row.roleId
      this.dialogFormData.name = row.name
      this.dialogFormData.pid = row.pid
      this.dialogFormData.roleKey = row.roleKey
      this.dialogFormData.sort = row.sort
      this.dialogFormData.status = "" + row.status
      this.dialogFormData.remark = row.remark

      this.dialogFormTitle = '修改角色'
      this.dialogType = 'update'
      this.dialogFormVisible = true
      this.isEdit = true
    },

    // 提交表单
    submitForm() {
      this.$refs['dialogForm'].validate(async valid => {
        if (valid) {
          this.submitLoading = true
          let msg = ''
          try {
            if (this.dialogType === 'create') {
              const { message } = await createRole(this.dialogFormData)
              msg = message
            } else {
              console.log(this.dialogFormData)
              const { message } = await updateRoleById(this.dialogFormData)
              msg = message
            }
          } finally {
            this.submitLoading = false
          }

          this.resetForm()
          this.getTableData()
          this.$message({
            showClose: true,
            message: msg,
            type: 'success'
          })
        } else {
          this.$message({
            showClose: true,
            message: '表单校验失败',
            type: 'error'
          })
          return false
        }
      })
    },

    // 提交表单
    cancelForm() {
      this.resetForm()
    },

    resetForm() {
      this.dialogFormVisible = false
      this.$refs['dialogForm'].resetFields()
      this.dialogFormData = {
        roleId:undefined,
        name: undefined,
        roleKey: undefined, 
        status: '2',
        pid: 0,
        sort: 10,
        remark: undefined
      }
    },

    // 批量删除
    batchDelete() {
      this.$confirm('此操作将永久删除, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async res => {
        this.loading = true
        const roleIds = []
        this.multipleSelection.forEach(x => {
          roleIds.push(x.roleId)
        })
        let msg = ''
        try {
          const { message } = await batchDeleteRoleByIds({ roleIds: roleIds })
          msg = message
        } finally {
          this.loading = false
        }

        this.getTableData()
        this.$message({
          showClose: true,
          message: msg,
          type: 'success'
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },

    //状态修改
    handleStatusChange(row) {
      let text = row.status === 2 ? "启用" : "停用";
      this.$confirm('确认要"' + text + '""' + row.name + '"角色吗?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return changeRoleStatus(row.roleId, row.status);
        }).then(() => {
            this.msgSuccess(text + "成功");
        }).catch(function() {
            row.status = row.status === 1 ? 2 : 1;
        });
    },
    // 表格多选
    handleSelectionChange(val) {
      this.multipleSelection = val
    },

    // 单个删除
    async singleDelete(roleId) {
      this.loading = true
      let msg = ''
      try {
        const { message } = await batchDeleteRoleByIds({ roleIds: [roleId] })
        msg = message
      } finally {
        this.loading = false
      }

      this.getTableData()
      this.$message({
        showClose: true,
        message: msg,
        type: 'success'
      })
    },

    // 修改权限按钮
    async updatePermission(roleId) {
      this.roleId = roleId
      this.permsDialogVisible = true
      this.getMenuTree()
      this.getApiTree()
      this.getRoleMenusById(roleId)
      this.getRoleApisById(roleId)
    },

    // 获取菜单树
    async getMenuTree() {
      this.menuTreeLoading = true
      try {
        const { data } = await getMenuTree()
        console.log(data)
        this.menuTree = data
      } finally {
        this.menuTreeLoading = false
      }
    },

    // 获取接口树
    async getApiTree() {
      this.apiTreeLoading = true
      try {
        const { data } = await getApiTree()
        this.apiTree = data
      } finally {
        this.apiTreeLoading = false
      }
    },

    // 获取角色的权限菜单
    async getRoleMenusById(roleId) {
      this.permissionLoading = true
      let rseData = []
      try {
        const { data } = await getRoleMenusById(roleId)
        rseData = data
      } finally {
        this.permissionLoading = false
      } 
      const menus = rseData || []
      const ids = []
      menus.forEach(x => {  ids.push(x.menuId) })
      this.defaultCheckedRoleMenu = ids
      this.$refs.roleMenuTree.setCheckedKeys(this.defaultCheckedRoleMenu)
    },

    // 获取角色的权限接口
    async getRoleApisById(roleId) {
      this.permissionLoading = true
      let resData = []
      try {
        const { data } = await getRoleApisById(roleId)
        resData = data
      } finally {
        this.permissionLoading = false
      }

      const apis = resData || []
      const ids = []
      apis.forEach(x => { ids.push(x.apiId) })
      this.defaultCheckedRoleApi = ids
      this.$refs.roleApiTree.setCheckedKeys(this.defaultCheckedRoleApi)
    },

    // 修改角色菜单
    async updateRoleMenusById() {
      this.permissionLoading = true
      let ids = this.$refs.roleMenuTree.getCheckedKeys()
      const idsHalf = this.$refs.roleMenuTree.getHalfCheckedKeys()
      ids = ids.concat(idsHalf)
      ids = [...new Set(ids)]

      try {
        await updateRoleMenusById({roleId:this.roleId, menuIds: ids})
      } finally {
        this.permissionLoading = false
      }

      this.permsDialogVisible = false
      this.$message({
        showClose: true,
        message: '更新角色菜单成功',
        type: 'success'
      })
    },

    // 修改角色接口
    async updateRoleApisById() {
      this.permissionLoading = true
      const ids = this.$refs.roleApiTree.getCheckedKeys(true)
      try {
        await updateRoleApisById({roleId:this.roleId,apiIds:ids})
      } finally {
        this.permissionLoading = false
      }

      this.permsDialogVisible = false
      this.$message({
        showClose: true,
        message: '更新角色接口成功',
        type: 'success'
      })
    },

    // 确定修改角色权限
    submitPermissionForm() {
      this.updateRoleMenusById()
      this.updateRoleApisById()
    },

    // 取消修改角色权限
    cancelPermissionForm() {
      this.permsDialogVisible = false
    },

    // 分页
    handleSizeChange(val) {
      this.params.pageSize = val
      this.getTableData()
    },
    handleCurrentChange(val) {
      this.params.pageNum = val
      this.getTableData()
    }
  }
}
</script>

<style scoped >
  .container-card{
    margin: 10px;
  }

  .role-menu{
    font-size: 15px;
  }
</style>

<style lang="scss">
  .perms-dialog > .el-dialog__body{
    padding-top: 0;
    padding-bottom: 15px;
  }
</style>

