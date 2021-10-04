import request from '@/utils/request'

// 查询登录日志列表
export function LoginLoglist(query) {
  return request({
    url: '/api/v1/loginLog/list',
    method: 'get',
    params: query
  })
}

// 删除登录日志
export function batchDeleteLog(ids) {
  return request({
    url: '/api/v1/loginLog/batchDelete',
    method: 'delete',
    data:{
        loginIds:ids
    }
  })
}

// 清空登录日志
export function clearLoginLog() {
  return request({
    url: '/api/v1/loginLog/clear',
    method: 'delete'
  })
}
 
