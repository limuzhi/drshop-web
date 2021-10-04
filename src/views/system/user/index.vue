<template>
  <div>
    <el-card class="container-card" shadow="always">
      <el-form size="mini" :inline="true" :model="params" class="demo-form-inline">
        <el-form-item label="关键字">
          <el-input v-model.trim="params.username" clearable placeholder="请输入用户账号或姓名" @clear="search" />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model.trim="params.mobile" clearable placeholder="手机号" @clear="search" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model.trim="params.status" clearable placeholder="状态" @change="search" @clear="search">
            <el-option
              v-for="dict in statusOptions"
              :key="dict.dictValue"
              :label="dict.dictLabel"
              :value="dict.dictValue"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="创建时间">
          <el-date-picker
            v-model="dateRange"
            size="small"
            style="width: 240px"
            value-format="yyyy-MM-dd"
            type="daterange"
            range-separator="-"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          ></el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-button :loading="loading" icon="el-icon-search" type="primary" @click="search">查询</el-button>
        </el-form-item>
        <el-form-item>
          <el-button v-permisaction="['systeam:menu:add']" :loading="loading" icon="el-icon-plus" type="warning" @click="create">新增</el-button>
        </el-form-item>
        <el-form-item>
          <el-button v-permisaction="['systeam:menu:delete']"  :disabled="multipleSelection.length === 0" :loading="loading" icon="el-icon-delete" type="danger" @click="batchDelete">批量删除</el-button>
        </el-form-item>
      </el-form>

      <el-table v-loading="loading" :data="tableData" border stripe style="width: 100%" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="用户编号" align="center" prop="userId" />
        <el-table-column align="center" prop="username" label="用户账号" />
        <el-table-column align="center" prop="nickname" label="用户昵称" />
        <el-table-column label="部门" align="center" prop="deptInfo.deptName" :show-overflow-tooltip="true" />
        <el-table-column label="角色" align="center" prop="roles" :show-overflow-tooltip="true" >
          <template slot-scope="scope">
              <span v-for="(item,index) of scope.row.roles" :key="index">   {{item.name}}   </span>
          </template>
        </el-table-column>
        <el-table-column label="岗位" align="center" prop="posts" :show-overflow-tooltip="true" >
          <template slot-scope="scope">
              <span v-for="(item,index) of scope.row.posts" :key="index">   {{item.postCode}}/{{item.postName}}   </span>
          </template>
        </el-table-column>
        <el-table-column align="center" prop="mobile" label="手机号" />
        <el-table-column align="center" label="状态" >
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.status"
               :active-value="2"
               :inactive-value="1"
              @change="handleStatusChange(scope.row)"
            ></el-switch>
          </template>
        </el-table-column>
        <el-table-column align="center" prop="remark" label="说明" />
        <el-table-column label="创建时间" align="center" prop="createdAt" />
        <el-table-column fixed="right" label="操作" align="center" width="120">
          <template slot-scope="scope">
            <el-tooltip content="编辑" effect="dark" placement="top">
              <el-button  v-permisaction="['systeam:menu:edit']" size="mini" icon="el-icon-edit" circle type="primary" @click="update(scope.row)" />
            </el-tooltip>
            <el-tooltip  class="delete-popover" content="删除" effect="dark" placement="top">
              <el-popconfirm title="确定删除吗？" @onConfirm="singleDelete(scope.row.userId)">
                <el-button v-permisaction="['systeam:menu:delete']" slot="reference" size="mini" icon="el-icon-delete" circle type="danger" />
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

      <el-dialog :title="dialogFormTitle" :visible.sync="dialogFormVisible" width="50%">
        <el-form ref="dialogForm" size="small" :model="dialogFormData" :rules="dialogFormRules" label-width="100px">
          <el-row> 
            <el-col :span="12">
                <el-form-item label="用户昵称" prop="nickname">
                  <el-input v-model.trim="dialogFormData.nickname" placeholder="用户昵称" />
                </el-form-item>
            </el-col>
             <el-col :span="12">
              <el-form-item label="归属部门" prop="deptId">
                <el-select v-model="dialogFormData.deptId"  placeholder="请选择">
                  <el-option
                    v-for="item in deptOptions"
                    :key="item.deptId"
                    :label="item.deptName"
                    :value="item.deptId"  
                  ></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="手机号" prop="mobile">
                <el-input v-model.trim="dialogFormData.mobile" placeholder="手机号" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
               <el-form-item label="邮箱" prop="email">
                <el-input v-model.trim="dialogFormData.email" placeholder="请输入邮箱" maxlength="50" />
               </el-form-item>
            </el-col>   
            <el-col :span="12">
              <el-form-item v-if="dialogFormData.userId == undefined" label="用户账号" prop="username">
                <el-input ref="password" v-model.trim="dialogFormData.username" placeholder="用户账号" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item v-if="dialogFormData.userId == undefined" :label="dialogType === 'create' ? '新密码':'重置密码'" prop="password">
                <el-input v-model.trim="dialogFormData.password" autocomplete="off" :type="passwordType" :placeholder="dialogType === 'create' ? '新密码':'重置密码'" />
                <span class="show-pwd" @click="showPwd">
                  <svg-icon :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'" />
                </span>
              </el-form-item>
            </el-col>  
            <el-col :span="12">
              <el-form-item label="状态" prop="status">
                <el-radio-group v-model.trim="dialogFormData.status">
                  <el-radio
                    v-for="dict in statusOptions"
                    :key="dict.dictValue"
                    :label="dict.dictValue"
                  >{{dict.dictLabel}}</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>  
            <el-col :span="12">
              <el-form-item label="用户性别">
                <el-select v-model="dialogFormData.sex" placeholder="请选择">
                  <el-option
                    v-for="dict in sexOptions"
                    :key="dict.dictValue"
                    :label="dict.dictLabel"
                    :value="dict.dictValue"
                  ></el-option>
                </el-select>
              </el-form-item>
            </el-col> 
            <el-col :span="12">
              <el-form-item label="岗位">
                <el-select v-model="dialogFormData.postIds" multiple placeholder="请选择">
                  <el-option
                    v-for="item in postOptions"
                    :key="item.postId"
                    :label="item.postName"
                    :value="item.postId"
                  ></el-option>
                </el-select>
              </el-form-item>
            </el-col>  
            <el-col :span="12">
              <el-form-item label="角色">
                <el-select v-model="dialogFormData.roleIds" multiple placeholder="请选择">
                  <el-option
                    v-for="item in roleOptions"
                    :key="item.roleId"
                    :label="item.name"
                    :value="item.roleId"
                  ></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="说明" prop="remark">
                <el-input v-model.trim="dialogFormData.remark" type="textarea" placeholder="说明" show-word-limit maxlength="100" />
              </el-form-item>
            </el-col>
            <el-col :span="24">
               <el-form-item label="用户类型">
                  <el-radio-group v-model="dialogFormData.isAdmin">
                    <el-radio
                      :label="1"
                    >后台管理员</el-radio>
                     <el-radio
                      :label="0"
                    >前台用户</el-radio>
                  </el-radio-group>
                </el-form-item>
             </el-col>
           </el-row>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button size="mini" @click="cancelForm()">取 消</el-button>
          <el-button size="mini" :loading="submitLoading" type="primary" @click="submitForm()">确 定</el-button>
        </div>
      </el-dialog>

    </el-card>
  </div>
</template>

<script>
import { encrypt } from '@/utils/jsencrypt'
import { getUsers, createUser, updateUserById, batchDeleteUserByIds, changeUserStatus, getPostAndRoleList } from '@/api/system/user'

export default {
  name: 'User',
  data() {
    var checkPhone = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('手机号不能为空'))
      } else {
        const reg = /^1[3|4|5|7|8][0-9]\d{8}$/
        if (reg.test(value)) {
          callback()
        } else {
          return callback(new Error('请输入正确的手机号'))
        }
      }
    }
    return {
      // 查询参数
      params: {
        username: '',
        status: '',
        mobile: '',
        deptId: undefined,
        pageNum: 1,
        pageSize: 10
      },
      // 表格数据
      tableData: [],
      total: 0,
      loading: true,
      // 状态数据字典
      statusOptions: [],
      // 性别状态字典
      sexOptions: [],
      // 默认密码
      initPassword: undefined,
      // 日期范围
      dateRange: [],
      // 岗位选项
      postOptions: [],
      // 部门选项
      deptOptions: [],
      // 角色选项
      roleOptions: [],
      passwordType: 'password',

      // dialog对话框
      submitLoading: false,
      dialogFormTitle: '',
      dialogType: '',
      dialogFormVisible: false,
      dialogFormData: {
        userId:undefined,
        username: '',
        deptId: undefined,
        password: '',
        nickname: '',
        mobile: '',
        email:undefined,
        sex:undefined,
        status: "2",
        avatar: '',
        remark: undefined,
        postIds: [],
        roleIds: [],
        isAdmin:1,
      },
      dialogFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 30, message: '长度在 6 到 30 个字符', trigger: 'blur' }
        ],
         deptId: [
          { required: true, message: "归属部门不能为空", trigger: "blur" }
        ],
        nickname: [
          { required: true, message: '请输入昵称', trigger: 'blur' },
          { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
        ],
         email: [
          { required: true, message: "邮箱地址不能为空", trigger: "blur" },
          {
            type: "email",
            message: "'请输入正确的邮箱地址",
            trigger: ["blur", "change"]
          }
        ],
        mobile: [
          { required: true, validator: checkPhone, trigger: 'blur' }
        ],
        status: [
          { required: false, message: '请选择状态', trigger: 'change' }
        ]
      },

      // 删除按钮弹出框
      popoverVisible: false,
      // 表格多选
      multipleSelection: []
    }
  },
  created() {
    this.getTableData()
    this.getPostRoleList()

    this.getDicts('sys_normal_disable').then(response => {
      this.statusOptions = response.data
    })
    this.getDicts('sys_user_sex').then(response => {
      this.sexOptions = response.data
    })
    this.getConfigKey('sys_user_initPassword').then(response => {
      this.initPassword = response.data.configValue
    })
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
        const { data } = await getUsers(this.addDateRange(this.params, this.dateRange))
        this.tableData = data.list
        console.log(this.tableData)
        this.total = data.count
      } finally {
        this.loading = false
      }
    },

    // 获取角色数据
    async getPostRoleList() {
      const res = await getPostAndRoleList()

      this.postOptions = res.data.postList
      this.roleOptions = res.data.roleList
      this.deptOptions = res.data.deptList
    },
    // 用户状态修改
    handleStatusChange(row) {
      let text = row.status === 2 ? "启用" : "停用";
      this.$confirm('确认要"' + text + '"："' + row.username + '"用户吗?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return changeUserStatus(row.userId, row.status);
        }).then(() => {
            this.msgSuccess(text + "成功");
        }).catch(function() {
            row.status = row.status === 1 ? 2 : 1;
        });
    },


    // 新增
    create() {
      this.dialogFormTitle = '新增用户'
      this.dialogType = 'create'
      this.dialogFormVisible = true
    },

    // 修改
    update(row) { 
      this.dialogFormData.userId = row.userId
      this.dialogFormData.username = row.username
      this.dialogFormData.password = '' 
      this.dialogFormData.deptId =  row.deptId 
      
      this.dialogFormData.nickname = row.nickname 
      this.dialogFormData.mobile = row.mobile
      this.dialogFormData.email = row.email
      this.dialogFormData.sex = undefined
      if (row.sex != undefined ) {
        this.dialogFormData.sex = "" + row.sex
      }
      
      console.log('sex:',this.dialogFormData.sex,"===",row.sex)
      this.dialogFormData.status = "" + row.status
      this.dialogFormData.avatar = row.avatar
      this.dialogFormData.isAdmin = row.isAdmin
      this.dialogFormData.remark = row.remark
      this.dialogFormData.roleIds = []
      if(row.roles){
          row.roles.forEach(item=>{
            this.dialogFormData.roleIds.push(item.roleId)
        })
      }
      this.dialogFormData.postIds = []
      if(row.posts){
          row.posts.forEach(item=>{
            this.dialogFormData.postIds.push(item.postId)
        })
      } 
      this.dialogFormTitle = '修改用户'
      this.dialogType = 'update'
      this.passwordType = 'password'
      this.dialogFormVisible = true 

    },

    // 提交表单
    submitForm() {
      this.$refs['dialogForm'].validate(async valid => {
        if (valid) {
          this.submitLoading = true

          this.dialogFormDataCopy = { ...this.dialogFormData }
          if (this.dialogFormData.password !== '') {
            //加密密码
            const encPassword = encrypt(this.dialogFormData.password)
            this.dialogFormDataCopy.password = encPassword
          }
          let msg = ''
          try {
            if (this.dialogType === 'create') {
              const { message } = await createUser(this.dialogFormDataCopy)
              msg = message
            } else {
              const { message } = await updateUserById(this.dialogFormDataCopy)
              console.log(message)
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
          userId:undefined,
          username: '',
          deptId: undefined,
          password: '',
          nickname: '',
          mobile: '',
          email:undefined,
          sex:undefined,
          status: "2",
          avatar: '',
          remark: undefined,
          postIds: [],
          roleIds: [],
          isAdmin:1,
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
        const userIds = []
        console.log('multipleSelection==',this.multipleSelection)
        this.multipleSelection.forEach(x => {
          userIds.push(x.userId)
        })
        let msg = ''
        try {
          const { message } = await batchDeleteUserByIds({ userIds: userIds })
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
          showClose: true,
          type: 'info',
          message: '已取消删除'
        })
      })
    },

    // 表格多选
    handleSelectionChange(val) {
      this.multipleSelection = val
    },

    // 单个删除
    async singleDelete(Id) {
      this.loading = true
      let msg = ''
      try {
        const { message } = await batchDeleteUserByIds({ userIds: [Id] })
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

    showPwd() {
      if (this.passwordType === 'password') {
        this.passwordType = ''
      } else {
        this.passwordType = 'password'
      }
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

<style scoped>
  .container-card{
    margin: 10px;
  }

  .delete-popover{
    margin-left: 10px;
  }

  .show-pwd {
    position: absolute;
    right: 10px;
    top: 3px;
    font-size: 16px;
    color: #889aa4;
    cursor: pointer;
    user-select: none;
  }
</style>
