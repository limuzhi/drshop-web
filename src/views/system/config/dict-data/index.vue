<template>
  <div>
    <el-card class="container-card" shadow="always">
      <el-form size="mini" :inline="true" :model="params" class="demo-form-inline">
        <el-form-item label="字典类型">
          <el-input v-model.trim="params.dictType" clearable placeholder="请输入字典类型" @clear="search" />
        </el-form-item>
        <el-form-item label="字典标签">
          <el-input v-model.trim="params.dictLabel" clearable placeholder="请输入字典标签" @clear="search" />
        </el-form-item>
        <el-form-item label="状态"> 
          <el-select v-model.trim="params.status" clearable placeholder="数据状态" @change="search" @clear="search">
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
          <el-button icon="el-icon-refresh" size="mini" @click="resetSearch">重置</el-button>
        </el-form-item>
        <el-form-item>
          <el-button  v-permisaction="['systeam:dictData:add']" :loading="loading" icon="el-icon-plus" type="warning" @click="create">新增</el-button>
        </el-form-item>
        <el-form-item>
          <el-button  v-permisaction="['systeam:dictData:delete']" :disabled="multipleSelection.length === 0" :loading="loading" icon="el-icon-delete" type="danger" @click="batchDelete">批量删除</el-button>
        </el-form-item>
      </el-form>

      <el-table v-loading="loading" :data="tableData" border stripe style="width: 100%" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column  prop="dictCode" label="字典编码" align="center" /> 
        <el-table-column  prop="dictLabel" label="字典标签" align="center"/>
        <el-table-column  prop="dictValue" label="字典键值" align="center"/> 
        <el-table-column  prop="dictSort" label="字典排序" align="center"/>
        <el-table-column label="状态" align="center" prop="status" :formatter="statusFormat" />
        <el-table-column label="备注" align="center" prop="remark" :show-overflow-tooltip="true" />
        <el-table-column label="创建时间" align="center" prop="createdAt" width="180"/>  
        <el-table-column fixed="right" label="操作" align="center" width="120">
          <template slot-scope="scope">
            <el-tooltip content="编辑" effect="dark" placement="top">
              <el-button v-permisaction="['systeam:dictData:edit']" size="mini" icon="el-icon-edit" circle type="primary" @click="update(scope.row)" />
            </el-tooltip>
            <el-tooltip class="delete-popover" content="删除" effect="dark" placement="top">
              <el-popconfirm title="确定删除吗？" @onConfirm="singleDelete(scope.row.dictCode)">
                <el-button v-permisaction="['systeam:dictData:delete']" slot="reference" size="mini" icon="el-icon-delete" circle type="danger" />
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
          <el-form-item label="字典类型">
            <el-input v-model.trim="dialogFormData.dictType"  :disabled="true" />
          </el-form-item>
          <el-form-item label="数据标签" prop="dictLabel">
            <el-input v-model.trim="dialogFormData.dictLabel" placeholder="请输入数据标签" />
          </el-form-item> 
          <el-form-item label="数据键值" prop="dictValue">
            <el-input v-model.trim="dialogFormData.dictValue" placeholder="请输入数据键值"  />
          </el-form-item>
          <el-form-item label="显示排序" prop="dictSort">
            <el-input-number v-model="dialogFormData.dictSort" controls-position="right" :min="1" max="999" />
          </el-form-item>
          <el-form-item label="系统默认">
              <el-switch v-model="dialogFormData.isDefault"
                  active-text="是"
                  inactive-text="否"
                  active-value="1"
                  inactive-value="2"
              ></el-switch>
          </el-form-item>
          <el-form-item label="状态" prop="status">
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
import { getDictDataList, createDictData, updateDictData, delDictData } from '@/api/system/config/dict-data'

export default {
  name: 'DictData', 
  data() {
    return {
      // 查询参数
      params: {
        dictName: undefined,
        dictType: undefined,
        status: undefined,
        pageNum: 1,
        pageSize: 10
      },
      // 表格数据
      tableData: [],
      total: 0,
      loading: false,
      isEdit: false,
      //状态数据字典
      statusOptions: [],
      // dialog对话框
      submitLoading: false,
       // 默认字典类型
      defaultDictType: '',
      dialogFormTitle: '',
      dialogType: '',
      dialogFormVisible: false,
      dialogFormData: {
        dictCode: undefined,
        dictLabel: undefined,
        dictType: undefined,
        dictValue: undefined,
        dictSort: 10,
        isDefault:"1",
        status: '2',
        remark: undefined
      },
      dialogFormRules: {
        dictLabel: [
          { required: true, message: '数据标签不能为空', trigger: 'blur' },
          { min: 1, max: 128, message: '长度在 1 到 128 个字符', trigger: 'blur' }
        ],
        dictValue: [
          { required: true, message: '数据键值不能为空', trigger: 'blur' },
          { min: 1, max: 128, message: '长度在 1 到 128 个字符', trigger: 'blur' }
        ],
        dictSort: [
          { required: true, message: '顺序不能为空', trigger: 'change' }
        ]
      },

      // 删除按钮弹出框
      popoverVisible: false,
      // 表格多选
      multipleSelection: []
    }
  },
  created() {
      const dictType = this.$route.query && this.$route.query.dictType;
      this.params.dictType = dictType
      this.defaultDictType = dictType
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
    resetSearch() {
        this.params.dictType = this.defaultDictType
        this.search()
    },
    // 获取表格数据
    async getTableData() {
      this.loading = true
      try {
        const { data } = await getDictDataList(this.params) 
        this.tableData = data.list
        this.total = data.count
      } finally {
        this.loading = false
      }
    },

    // 新增
    create() { 
      this.dialogFormTitle = '新增字典数据'
      this.dialogType = 'create'
      this.dialogFormVisible = true
      this.isEdit = false
      this.dialogFormData.dictType = this.defaultDictType
    },

    // 修改
    update(row) { 
      this.dialogFormData.dictCode = row.dictCode
      this.dialogFormData.dictType = row.dictType
      this.dialogFormData.dictLabel = row.dictLabel
      this.dialogFormData.dictValue = row.dictValue
      this.dialogFormData.status = row.status+''
      this.dialogFormData.dictSort = "" + row.dictSort 
      this.dialogFormData.isDefault = "" + row.isDefault 
      this.dialogFormData.remark =  row.remark

      this.dialogFormTitle = '修改字典数据'
      this.dialogType = 'update'
      this.dialogFormVisible = true
      this.isEdit = true
    },

    // 提交表单
    submitForm() {
      this.$refs['dialogForm'].validate(async valid => {
        if (valid) {
          let msg = ''
          this.submitLoading = true
 
          this.dialogFormData.status = this.dialogFormData.status+''
          this.dialogFormData.dictSort = this.dialogFormData.dictSort*1
          this.dialogFormData.isDefault = this.dialogFormData.isDefault*1
          try {
            if (this.dialogType === 'create') {
              const { message } = await createDictData(this.dialogFormData)
              msg = message
            } else {
              const { message } = await updateDictData(this.dialogFormData)
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
        dictCode: undefined,
        dictLabel: undefined,
        dictValue: undefined,
        dictSort: 10,
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
          ids.push(x.dictCode)
        })
        let msg = ''
        try {
          const { message } = await delDictData({ dictCodes: ids })
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

    // 参数系统内置字典翻译
    statusFormat(row, column) {
      return this.selectDictLabel(this.statusOptions, row.status)
    },
    // 单个删除
    async singleDelete(Id) {
      this.loading = true
      let msg = ''
      try {
        const { message } = await delDictData({ dictCodes: [Id] })
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
