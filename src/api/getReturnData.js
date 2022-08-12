import httpRequest from '@/request/index'

export function getReturnData(param) {
    return httpRequest({
        url: 'test',
        method: 'post',
        data: param,
    })
}