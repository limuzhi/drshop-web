<template>
  <div> 
     <el-card class="container-card" shadow="always">
        <el-form size="mini" :inline="true" class="demo-form-inline">
            <el-form-item label="部门名称">
              <el-input
              v-model="params.deptName"
              placeholder="请输入部门名称"
              clearable
              size="small"
              @keyup.enter.native="handleQuery" @clear="search"
              />
            </el-form-item>
            <el-form-item label="状态">
              <el-select v-model="params.status" placeholder="部门状态" clearable size="small" @change="search" @clear="search">
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
                <el-button  v-permisaction="['systeam:dept:add']" :loading="loading" icon="el-icon-plus" type="warning" @click="create">新增</el-button>
            </el-form-item> 
        </el-form>

       <el-table v-loading="loading" 
        :tree-props="{children: 'children', hasChildren: 'hasChildren'}" 
        row-key="deptId" :data="tableData"  
        border  stripe style="width: 100%" @selection-change="handleSelectionChange">
         <el-table-column  prop="deptName" label="部门名称" align="center" />
        <el-table-column  prop="sort" label="排序" align="center"/> 
        <el-table-column prop="status" label="状态" :formatter="statusFormat" width="100">
            <template slot-scope="scope">
              <el-tag
                :type="scope.row.status === 2 ? 'success': 'danger' "
                disable-transitions
              >{{ statusFormat(scope.row) }}</el-tag>
            </template>
        </el-table-column>
        <el-table-column label="创建时间" align="center" prop="createdAt" width="200" />  
        <el-table-column fixed="right" label="操作" align="center" width="120">
          <template slot-scope="scope">
            <el-tooltip content="编辑" effect="dark" placement="top">
              <el-button v-permisaction="['systeam:dept:edit']" size="mini" icon="el-icon-edit" circle type="primary" @click="update(scope.row)" />
            </el-tooltip>
            <el-tooltip class="delete-popover" content="删除" effect="dark" placement="top">
              <el-popconfirm title="确定删除吗？" @onConfirm="singleDelete(scope.row.deptId)">
                <el-button v-permisaction="['systeam:dept:delete']" slot="reference" size="mini" icon="el-icon-delete" circle type="danger" />
              </el-popconfirm>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>  

       <el-dialog :title="dialogFormTitle" :visible.sync="dialogFormVisible" width="580px">
        <el-form ref="dialogForm" :inline="true" size="small" :model="dialogFormData" :rules="dialogFormRules" label-width="80px">
          <el-form-item label="上级部门" prop="parentId"> 
            <treeselect
              v-model="dialogFormData.parentId"
              :options="treeselectData"
              :normalizer="normalizer"
              style="width:440px"
              @input="treeselectInput"
            />
          </el-form-item>
          <el-form-item label="部门名称" prop="deptName">
            <el-input v-model.trim="dialogFormData.deptName" placeholder="请输入部门名称" maxlength="30" />
          </el-form-item>
          <el-form-item label="显示排序" prop="sort">
            <el-input-number v-model="dialogFormData.sort" controls-position="right" :min="1" :max="999" />
          </el-form-item>  
          <el-form-item label="负责人" prop="leader">
            <el-input v-model="dialogFormData.leader" placeholder="请输入负责人" maxlength="20" />
          </el-form-item>
          <el-form-item label="联系电话" prop="phone">
            <el-input v-model="dialogFormData.phone" placeholder="请输入联系电话" maxlength="11" />
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="dialogFormData.email" placeholder="请输入邮箱" maxlength="50" />
          </el-form-item>
          <el-form-item label="部门状态" prop="status">
            <el-radio-group v-model.trim="dialogFormData.status">
              <el-radio
                v-for="dict in statusOptions"
                :key="dict.dictValue"
                :label="dict.dictValue"
              >{{dict.dictLabel}}</el-radio>
            </el-radio-group>
          </el-form-item>
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
import { getDeptTree, getDept, delDept, addDept, updateDept } from '@/api/system/dept'
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'

export default {
  name: 'Dept',
  components: { Treeselect }, 
  data() {
    return {
      // 查询参数
      params: {
        deptName: undefined, 
        status: undefined,  
      },
      // 表格数据
      tableData: [],
      total: 0,
      loading: false, 
        //上级数据
      treeselectData: [],
      // 部门树选项
      deptOptions: [],
      // 状态数据字典
      statusOptions: [],
      // dialog对话框
      submitLoading: false,
      dialogFormTitle: '',
      dialogType: '',
      dialogFormVisible: false,
      dialogFormData: {
          deptId:undefined,
          parentId: 0,
          ancestors:undefined,
          deptName: undefined,
          sort: 10,
          leader:undefined,
          phone: undefined,
          email: undefined,
          status:'2',
      },
      dialogFormRules: {
        parentId: [
          { required: true, message: '上级部门不能为空', trigger: 'blur' }
        ],
        deptName: [
          { required: true, message: '部门名称不能为空', trigger: 'blur' },
          { min: 1, max: 30, message: '长度在 1 到 30 个字符', trigger: 'blur' }
        ],
        sort: [
          { required: true, message: '顺序不能为空', trigger: 'blur' }
        ],
        leader: [
          { required: true, message: '负责人不能为空', trigger: 'blur' },
          { min: 1, max: 30, message: '长度在 1 到 30 个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '邮箱地址不能为空', trigger: 'blur' },
          {
            type: 'email',
            message: "'请输入正确的邮箱地址",
            trigger: ['blur', 'change']
          }
        ],
        phone: [
          { required: true, message: '手机号码不能为空', trigger: 'blur' },
          {
            pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
            message: '请输入正确的手机号码',
            trigger: 'blur'
          }
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
 
    this.getDicts('sys_normal_disable').then(response => {
       this.statusOptions = response.data
    })
  },
  methods: {
    // 查询
    search() { 
      this.getTableData()
    },

        // 获取表格数据
    async getTableData() {
      this.loading = true
      try {
        const { data } = await getDeptTree(this.params) 
        this.tableData = data
        this.treeselectData = [{ deptId: 0, deptName: '顶级部门', children: data }]
      } finally {
        this.loading = false
      }
    },

    // 新增
    create() { 
      this.getTreeselect('create')
      this.dialogFormTitle = '添加部门'
      this.dialogType = 'create'
      this.dialogFormVisible = true 
    },

    // 修改
    update(row) { 
      this.getTreeselect('update')
      this.dialogFormData.deptId = row.deptId
      this.dialogFormData.deptName = row.deptName
      this.dialogFormData.sort = row.sort
      this.dialogFormData.leader = row.leader
      this.dialogFormData.phone = row.phone
      this.dialogFormData.email = row.email
       this.dialogFormData.status = "" + row.status
      if (row.parentId) {
        this.dialogFormData.parentId = row.parentId
      }   
      this.dialogFormTitle = '修改部门'
      this.dialogType = 'update'
      this.dialogFormVisible = true
    },
      /** 查询部门下拉树结构 */
    getTreeselect(e) {
      getDeptTree().then(response => {
        this.deptOptions = [] 
        if (e === 'update') {
          const dept = { deptId: 0, deptName: '顶级部门', children: [], isDisabled: true }
          dept.children = response.data
          this.deptOptions.push(dept)
        } else {
          const dept = { deptId: 0, deptName: '顶级部门', children: [] }
          dept.children = response.data
          this.deptOptions.push(dept)
        }
      })
    },
     
     
    // 提交表单
    submitForm() {
      this.$refs['dialogForm'].validate(async valid => {
        if (valid) {
          let msg = ''
          this.submitLoading = true
          if (this.dialogFormData.deptId === this.dialogFormData.parentId) {
            return this.$message({
              showClose: true,
              message: '不能选择自身作为自己的上级',
              type: 'error'
            })
          }
          try {
            if (this.dialogType === 'create') {
              const { message } = await addDept(this.dialogFormData)
              msg = message
            } else {
              const { message } = await updateDept(this.dialogFormData)
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
    // 字典状态字典翻译
    statusFormat(row) {
      return this.selectDictLabel(this.statusOptions, parseInt(row.status))
    },
    // 提交表单
    cancelForm() {
      this.resetForm()
    },

    resetForm() {
      this.dialogFormVisible = false
      this.$refs['dialogForm'].resetFields()
      this.dialogFormData = {
            deptId:undefined,
            parentId:0,
            deptName:undefined,
            sort:10,
            leader: undefined,
            phone: undefined,
            email: undefined,
            status: '2'
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
        const ids = []
        this.multipleSelection.forEach(x => {
          ids.push(x.deptId)
        })
        let msg = ''
        try {
          const { message } = await delDept({ deptIds: ids })
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
        const { message } = await delDept({ deptIds: [Id] })
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
      // treeselect
    normalizer(node) {
      return {
        id: node.deptId,
        label: node.deptName,
        children: node.children
      }
    },
    treeselectInput(value) {
      this.treeselectValue = value
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
</style>
