<template>
  <div class="app-container">
    <div v-if="user">
      <el-row :gutter="20"> 
        <el-col :span="6" :xs="24">
          <el-card class="box-card">
            <div slot="header" class="clearfix">
              <span>个人信息</span>
            </div>
            <div>
              <div class="text-center">
                <userAvatar :user="user" />
              </div>
              <ul class="list-group list-group-striped">
                <li class="list-group-item">
                  <svg-icon icon-class="user" />用户名称
                  <div class="pull-right">{{ user.username }}</div>
                </li>
                <li class="list-group-item">
                  <svg-icon icon-class="phone" />手机号码
                  <div class="pull-right">{{ user.mobile }}</div>
                </li>
                <li class="list-group-item">
                  <svg-icon icon-class="email" />用户邮箱
                  <div class="pull-right">{{ user.email }}</div>
                </li>
                <li class="list-group-item">
                  <svg-icon icon-class="tree" />所属岗位
                  <div class="pull-right" v-if="user.deptInfo">{{ user.deptInfo.deptName }}</div>
                </li>
                <li class="list-group-item">
                  <svg-icon icon-class="tree" />所属部门
                  <div class="pull-right" v-if="user.deptInfo">{{ postGroup }}</div>
                </li>
                <li class="list-group-item">
                  <svg-icon icon-class="peoples" />所属角色
                  <div class="pull-right">{{ roleGroup }}</div>
                </li>
                <li class="list-group-item">
                  <svg-icon icon-class="el-date" />创建日期
                  <div class="pull-right">{{ user.createdAt }}</div>
                </li>
              </ul>
            </div>
          </el-card>
        </el-col> 
        <el-col :span="18" :xs="24"> 
          <el-card>
            <div slot="header" class="clearfix">
               <span>基本资料</span>
            </div>
            <el-tabs v-model="activeTab">
              <el-tab-pane label="基本资料" name="userinfo">
                <userInfo :user="user" />
              </el-tab-pane>
              <el-tab-pane label="修改密码" name="resetPwd">
                <resetPwd :user="user" />
              </el-tab-pane>
            </el-tabs>
          </el-card>
        </el-col> 
      </el-row>
    </div>
  </div>
</template>

<script>  

import PanThumb from '@/components/PanThumb'
import resetPwd from "./resetPwd";
import userInfo from "./userInfo";
import { getUserProfile } from "@/api/system/user";

export default {
  name: 'Profile',
  components: { PanThumb, userInfo, resetPwd },
  data() {
    return {
      user: {},
      activeTab: 'userinfo'
    }
  },
  computed: {
     postGroup(){
      if(Array.isArray(this.user.posts)){
        return this.user.posts.reduce(function(total, currentValue, currentIndex, arr){
          return total + currentValue.postName + " "
        }, "")
      }
      return ""
    },
     roleGroup(){
      if(Array.isArray(this.user.roles)){
        return this.user.roles.reduce(function(total, currentValue, currentIndex, arr){
          return total + currentValue.name + " "
        }, "")
      }
      return ""
    }
  },
  created() {
    this.getUser()
  },
  methods: {
    getUser() {
       getUserProfile().then(response => {
        this.user = response.data;
      });
    }
  }
}
</script> 