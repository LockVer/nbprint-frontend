import { computed } from "vue"

export const checkDetail = [
    {
        label: "异常项",
        name: 'exceptionItem'
    },
    {
        label: '备注',
        name: 'remark'
    },
    {
        label: '审核人',
        name: 'name'
    }
]

export const general = [
    {
        label: "产品名称",
        name: 'name'
    },
    {
        label: '产品译名',
        name: 'translatedName'
    },
    {
        label: '客户名称',
        name: 'customerName'
    },
    {
        label: '货币符号',
        name: 'currency'
    },
    {
        label: '业务员',
        name: 'businessPeople'
    }
]

export const smallCard = [
    {
        label: "尺寸",
        name: 'size'
    },
    {
        label: '揭开口数量',
        name: 'openNumber'
    },
    {
        label: '小卡单价',
        name: 'price'
    },
    {
        label: '刀模开口方向',
        name: 'direction'
    },
    {
        label: '盒号位置',
        name: 'boxCodePosition'
    },
    {
        label: '盒号',
        name: 'boxCode'
    },
    {
        label: '盒数',
        name: 'boxCount'
    },
    {
        label: '每盒数量',
        name: 'quantityPerBox'
    }
]

export const adCard = [
    {
        label: "数量",
        name: 'adNumber',
        value: 2,
        items1: [
            {
                label: "宣传卡1 有无揭开口",
                name: 'adUncover'
            },
            {
                label: '宣传卡1 背景图',
                name: 'adImage'
            },
            {
                label: '宣传卡1 是否有揭开区',
                name: 'adOpenRegion'
            },
            {
                label: '宣传卡1 揭开区数量',
                name: 'adOpenNumber'
            },
            {
                label: '宣传卡1 备注',
                name: 'adComment'
            }
        ]
    }
]



// "prizeMark": [
//     {
//         "type": "奖符种类",
//         "name": "奖符名称",
//         "image": "奖符图片.jpg",
//         "amount": 11111,
//         "count": 12,
//         "total": 133332,
//         "comment": "奖符备注"
//     },
//     {
//         "type": "奖符种类",
//         "name": "奖符名称",
//         "image": "奖符图片.jpg",
//         "amount": 11111,
//         "count": 12,
//         "total": 133332,
//         "comment": "奖符备注"
//     },
//     {
//         "type": "奖符种类",
//         "name": "奖符名称",
//         "image": "奖符图片.jpg",
//         "amount": 11111,
//         "count": 12,
//         "total": 133332,
//         "comment": "奖符备注"
//     }
// ]

// const prizeMark = [
//     {
//         "type": "奖符种类",
//         item: [
//             {
//                 "name": "1",
//                 "image": "奖符图片.jpg",
//                 "amount": 11111,
//                 "count": 12,
//                 "total": 133332,
//                 "comment": "奖符备注"
//             }
//         ]
//     }
// ]
