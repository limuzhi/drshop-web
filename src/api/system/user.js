import request from '@/utils/request'

// 获取当前登录用户信息
export function getInfo() {
  return request({
    url: '/api/v1/user/info',
    method: 'GET'
  })
}

// 获取用户列表
export function getUsers(params) {
  return request({
    url: '/api/v1/user/list',
    method: 'get',
    params
  })
}

// 更新用户登录密码
export function changePwd(data) {
  return request({
    url: '/api/v1/user/changePwd',
    method: 'put',
    data
  })
}

// 创建用户
export function createUser(data) {
  return request({
    url: '/api/v1/user/create',
    method: 'post',
    data
  })
}

// 更新用户
export function updateUserById(data) {
  return request({
    url: '/api/v1/user/update',
    method: 'put',
    data
  })
}

// 批量删除用户
export function batchDeleteUserByIds(data) {
  return request({
    url: '/api/v1/user/batchDelete',
    method: 'delete',
    data
  })
}

// 用户状态修改--
export function changeUserStatus(userId, status) {
  const data = {
    userId,
    status
  }
  return request({
    url: '/api/v1/user/changeStatus',
    method: 'put',
    data: data
  })
}

// 角色与岗位列表--
export function getPostAndRoleList() {
  return request({
    url: '/api/v1/user/postroleList',
    method: 'get'
  })
}


// 用户头像上传
export function uploadAvatar(data) {
  return request({
    url: '/api/v1/user/avatar',
    method: 'post',
    data: data
  })
}

// 查询用户个人信息
export function getUserProfile() {
  return request({
    url: '/api/v1/user/profile',
    method: 'get'
  })
}
 
 //更新个人信息
export function userProfileSet(data) {
  return request({
    url: '/api/v1/user/profileSet',
    method: 'put',
    data
  })
}