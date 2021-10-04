import request from '@/utils/request'

// 获取角色列表
export function getRoles(params) {
  return request({
    url: '/api/v1/role/list',
    method: 'get',
    params
  })
}

// 创建角色
export function createRole(data) {
  return request({
    url: '/api/v1/role/create',
    method: 'post',
    data
  })
}

// 更新角色
export function updateRoleById(data) {
  return request({
    url: '/api/v1/role/update',
    method: 'put',
    data
  })
}

// 获取角色的权限菜单
export function getRoleMenusById(roleId) {
  return request({
    url: '/api/v1/role/menus?roleId=' + roleId,
    method: 'get' 
  })
}

// 更新角色的权限菜单
export function updateRoleMenusById(data) {
  return request({
    url: '/api/v1/role/menus/update',
    method: 'put', 
    data
  })
}

// 获取角色的权限接口
export function getRoleApisById(roleId) {
  return request({
    url: '/api/v1/role/apis?roleId=' + roleId,
    method: 'get'
  })
}

// 更新角色的权限接口
export function updateRoleApisById(data) {
  return request({
    url: '/api/v1/role/apis/update',
    method: 'put',
    data
  })
}

// 批量删除角色
export function batchDeleteRoleByIds(data) {
  return request({
    url: '/api/v1/role/batchDelete',
    method: 'delete',
    data
  })
}

// 角色状态修改
export function changeRoleStatus(roleId, status) {
  const data = {
    roleId,
    status
  }
  return request({
    url: '/api/v1/role/changeStatus',
    method: 'put',
    data: data
  })
}