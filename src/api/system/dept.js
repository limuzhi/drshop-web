import request from '@/utils/request'

export function getDeptList(query) {
  return request({
    url: '/api/v1/dept/list',
    method: 'get',
    params: query
  })
}

// 查询部门详细
export function getDept(deptId) {
  return request({
    url: '/api/v1/dept/detail?deptId=' + deptId,
    method: 'get'
  })
}

// 查询部门下拉树结构
export function getDeptTree(query) {
  return request({
    url: '/api/v1/dept/tree',
    method: 'get',
    params: query
  })
}

// 根据角色ID查询部门树结构
 

// 新增部门
export function addDept(data) {
  return request({
    url: '/api/v1/dept/create',
    method: 'post',
    data: data
  })
}

// 修改部门
export function updateDept(data) {
  return request({
    url: '/api/v1/dept/update',
    method: 'put',
    data: data
  })
}

// 删除部门
export function delDept(data) {
  return request({
    url: '/api/v1/dept/delete',
    method: 'delete',
    data: data
  })
}
