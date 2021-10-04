<template>
  <div>
    <el-card class="container-card" shadow="always">
      <el-form size="mini" :inline="true" :model="params" class="demo-form-inline">
        <el-form-item label="岗位编码">
          <el-input v-model.trim="params.postCode" clearable placeholder="请输入岗位编码" @clear="search" />
        </el-form-item>
        <el-form-item label="岗位名称">
          <el-input v-model.trim="params.postName" clearable placeholder="请输入岗位名称" @clear="search" />
        </el-form-item>
        <el-form-item label="状态"> 
          <el-select v-model.trim="params.status" clearable placeholder="岗位状态" @change="search" @clear="search">
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
          <el-button   v-permisaction="['systeam:post:add']" :loading="loading" icon="el-icon-plus" type="warning" @click="create">新增</el-button>
        </el-form-item>
        <el-form-item>
          <el-button   v-permisaction="['systeam:post:delete']" :disabled="multipleSelection.length === 0" :loading="loading" icon="el-icon-delete" type="danger" @click="batchDelete">批量删除</el-button>
        </el-form-item>
      </el-form>

      <el-table v-loading="loading" :data="tableData" border stripe style="width: 100%" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column  prop="postId" label="岗位编号" align="center" />
        <el-table-column  prop="postCode" label="岗位编码" align="center"/> 
        <el-table-column  prop="postName" label="岗位名称" align="center"/>
        <el-table-column  prop="postSort" label="岗位排序" align="center"  />
        <el-table-column  prop="status" label="状态" align="center" :formatter="statusFormat">
            <template slot-scope="scope">
              <el-tag
                :type="scope.row.status === 2 ? 'success' : 'danger'"
                disable-transitions
              >{{ statusFormat(scope.row) }}</el-tag>
            </template>
        </el-table-column>
        <el-table-column  prop="remark" label="备注" />
        <el-table-column fixed="right" label="操作" align="center" width="120">
          <template slot-scope="scope">
            <el-tooltip content="编辑" effect="dark" placement="top">
              <el-button v-permisaction="['systeam:post:edit']" size="mini" icon="el-icon-edit" circle type="primary" @click="update(scope.row)" />
            </el-tooltip>
            <el-tooltip class="delete-popover" content="删除" effect="dark" placement="top">
              <el-popconfirm title="确定删除吗？" @onConfirm="singleDelete(scope.row.postId)">
                <el-button v-permisaction="['systeam:post:delete']" slot="reference" size="mini" icon="el-icon-delete" circle type="danger" />
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

      <el-dialog :title="dialogFormTitle" :visible.sync="dialogFormVisible">
        <el-form ref="dialogForm" size="small" :model="dialogFormData" :rules="dialogFormRules" label-width="120px">
          <el-form-item label="岗位名称" prop="postName">
            <el-input v-model.trim="dialogFormData.postName" placeholder="请输入岗位名称" />
          </el-form-item>
          <el-form-item label="岗位编码" prop="postCode">
            <el-input v-model.trim="dialogFormData.postCode" placeholder="请输入编码名称" />
          </el-form-item> 
          <el-form-item label="岗位顺序" prop="postSort">
              <el-input-number v-model="dialogFormData.postSort" controls-position="right" :min="1" :max="999" />
          </el-form-item>
          <el-form-item label="岗位状态" prop="status">
              <el-radio-group v-model="dialogFormData.status">
                <el-radio
                  v-for="dict in statusOptions"
                  :key="dict.dictValue"
                  :label="dict.dictValue"
                >{{ dict.dictLabel }}</el-radio>
              </el-radio-group>
          </el-form-item>  
          <el-form-item label="备注" prop="remark">
            <el-input v-model.trim="dialogFormData.remark" type="textarea" placeholder="请输入内容" show-word-limit maxlength="100" />
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
import { getPostList, createPost, updatePostById, batchDeletePostByIds } from '@/api/system/post'

export default {
  name: 'Post', 
  data() {
    return {
      // 查询参数
      params: {
        postCode: undefined,
        postName: undefined,
        status: undefined,
        pageNum: 1,
        pageSize: 10
      },
      // 表格数据
      tableData: [],
      total: 0,
      loading: false,

      // 状态数据字典
      statusOptions: [],
      // dialog对话框
      submitLoading: false,
      dialogFormTitle: '',
      dialogType: '',
      dialogFormVisible: false,
      dialogFormData: {
        postId:undefined,
        postCode: undefined,
        postName:undefined,
        postSort: 10,
        status: '2', 
        remark: undefined
      },
      dialogFormRules: {
        postName: [
          { required: true, message: '岗位名称不能为空', trigger: 'blur' },
          { min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: 'blur' }
        ],
        postCode: [
          { required: true, message: '岗位编码不能为空', trigger: 'blur' },
          { min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: 'blur' }
        ],
        postSort: [
          { required: true, message: '岗位顺序不能为空', trigger: 'change' }
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
      this.params.pageNum = 1
      this.getTableData()
    },

    // 获取表格数据
    async getTableData() {
      this.loading = true
      try {
        const { data } = await getPostList(this.params)
        console.log(data)
        this.tableData = data.list
        this.total = data.count
      } finally {
        this.loading = false
      }
    },

    // 新增
    create() {
      this.dialogFormTitle = '新增接口'
      this.dialogType = 'create'
      this.dialogFormVisible = true
    },

    // 修改
    update(row) {
      this.dialogFormData.postId = row.postId
      this.dialogFormData.postCode = row.postCode
      this.dialogFormData.postName = row.postName
      this.dialogFormData.postSort = "" + row.postSort 
      this.dialogFormData.remark = row.remark
      this.dialogFormData.status = "" +row.status

      this.dialogFormTitle = '修改接口'
      this.dialogType = 'update'
      this.dialogFormVisible = true
    },

    // 提交表单
    submitForm() {
      this.$refs['dialogForm'].validate(async valid => {
        if (valid) {
          let msg = ''
          this.submitLoading = true

          this.dialogFormData.postSort = this.dialogFormData.postSort*1 
          this.dialogFormData.status = this.dialogFormData.status*1
          try {
            if (this.dialogType === 'create') {
              const { message } = await createPost(this.dialogFormData)
              msg = message
            } else {
              const { message } = await updatePostById(this.dialogFormData)
              msg = message
            }
          } finally {
            this.submitLoading = false
          } 
          //this.resetForm()
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
        postId:undefined,
        postCode: undefined,
        postName:undefined,
        postSort: 10,
        status: '2', 
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
        const ids = []
        this.multipleSelection.forEach(x => {
          ids.push(x.postId)
        })
        let msg = ''
        try {
          const { message } = await batchDeletePostByIds({ postIds: ids })
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

   // 岗位状态字典翻译
    statusFormat(row, column) {
      return this.selectDictLabel(this.statusOptions, row.status);
    },
    // 单个删除
    async singleDelete(Id) {
      this.loading = true
      let msg = ''
      try {
        const { message } = await batchDeletePostByIds({ postIds: [Id] })
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
</style>
