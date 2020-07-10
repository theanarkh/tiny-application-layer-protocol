// 开始标识符
const PACKET_START = 0x3;
// 结尾标识符
const PACKET_END = 0x4;
// 整个数据包长度
const TOTAL_LENGTH = 4;
// 序列号长度
const SEQ_LEN = 4;
// 数据包头部长度
const HEADER_LEN = TOTAL_LENGTH + SEQ_LEN;

// 表示一个协议包
class Packet {
    constructor() {
        this.length = 0;
        this.seq = 0;
        this.data = null;
    }
    set(field, value) {
        this[field] = value;
    }
    get(field) {
        return this[field];
    }
}
// 解析器状态
const PARSE_STATE = {
  PARSE_INIT: 0,
  PARSE_HEADER: 1,
  PARSE_DATA: 2,
  PARSE_END: 3,
};
// 保存当前正在解析的数据包
var packet;
const STATE_TRANSITION = {
    [PARSE_STATE.PARSE_INIT](data) {
        if (!data || !data[0]) {
            return [-1, data];
        }
        if (data[0] !== PACKET_START) {
            return [-1, data ? data.slice(1) : data];
        }
        packet = new Packet();
        // 跳过开始标记符
        return [PARSE_STATE.PARSE_HEADER, data.slice(Buffer.from([PACKET_START]).length)];
    },
    [PARSE_STATE.PARSE_HEADER](data) {
        if (data.length < HEADER_LEN) {
          return [-1, data];
        }
        // 有效数据包的长度 = 整个数据包长度 - 头部长度
        packet.set('length', data.readUInt32BE() - HEADER_LEN);
        // 序列号
        packet.set('seq', data.readUInt32BE(TOTAL_LENGTH));
        // 解析完头部了，跳过去
        data = data.slice(HEADER_LEN);
        return [PARSE_STATE.PARSE_DATA, data];
    },
    [PARSE_STATE.PARSE_DATA](data) {
        const len = packet.get('length');
        if (data.length < len) {
            return [-1, data];
        }
        packet.set('data', data.slice(0, len));
        // 解析完数据了，完成一个包的解析，跳过数据部分和结束符
        data = data.slice(len);
        // 解析完一个数据包，输出
        return [PARSE_STATE.PARSE_END, data];
    },
    [PARSE_STATE.PARSE_END](data) {
        if (!data || !data[0]) {
            return [-1, data];
        }
        if (data[0] !== PACKET_END) {
            return [-1, data ? data.slice(1) : data];
        }
        console.log('parse success: ', packet);
        // 跳过开始标记符
        return [PARSE_STATE.PARSE_INIT, data.slice(Buffer.from([PACKET_START]).length)];
    },
  };
/**
 * 
 * @param {*} state 状态和处理函数的集合
 * @param {*} initState 初始化状态
 * @param {*} endState 结束状态
 */
function getMachine(state, initState, endState) {
    // 保存初始化状态
    let ret = initState;
    let buffer;
    return function(data) {
        if (ret === endState) {
            return;
        }
        if (data) {
            buffer = buffer ? Buffer.concat([buffer, data]) : data;
        }
        // 还没结束，继续执行
        while(ret !== endState) {
            if (!state[ret]) {
                return;
            }
            /*
                执行状态处理函数，返回[下一个状态, 剩下的数据]，
            */
            const result = state[ret](buffer);
            // 如果下一个状态是-1或者返回的数据是空说明需要更多的数据才能继续解析
            if (result[0] === -1) {
                return;
            }
            // 记录下一个状态和数据
            [ret, buffer] = result;
            if (!buffer.length) {
                return;
            }
        }
    }
}
module.exports = getMachine(STATE_TRANSITION, PARSE_STATE.PARSE_INIT, -2);