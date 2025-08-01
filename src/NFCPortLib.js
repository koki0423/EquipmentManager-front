/* eslint-disable */
/*
 * brief    NFC Port Library of WebClient
 * date     2021/09/21
 * author   Copyright 2019,2020,2021 Sony Corporation
 */
class NFCPortError extends Error {
    static get INTERNAL_ERROR() {
        return -2
    }
    static get UNKNOWN_ERROR() {
        return -1
    }
    static get INVALID_PARAMETER() {
        return 1002
    }
    static get CANTCALLOUT_LIBRARY_STATUS() {
        return 1004
    }
    static get API_CALL_IN_PROGRESS() {
        return 1008
    }
    static get API_NOT_SUPPORTED() {
        return 1009
    }
    static get DEVICE_NOT_FOUND() {
        return 2018
    }
    static get DEVICE_OPEN_ERROR() {
        return 2019
    }
    static get DEVICE_FATAL_ERROR() {
        return 2020
    }
    static get TRANSFER_ERROR() {
        return 3001
    }
    static get INVALID_RESPONSE() {
        return 3003
    }
    static get INVALID_STATUS() {
        return 3004
    }
    static get ACK_TIMEOUT() {
        return 3005
    }
    static get DATA_RECEIVE_TIMEOUT() {
        return 3006
    }
    static get COMMAND_SLOT_BUSY() {
        return 3007
    }
    static get GET_ACCESS_AUTHORITY_ERROR() {
        return 3008
    }
    static get CARD_NOT_DETECTED() {
        return 4e3
    }
    static get AUTHENTICATION_ERROR() {
        return 4001
    }
    static get THRU_RESPONSE_PACKET_NOT_RECEIVED() {
        return 4002
    }
    constructor(e, r, t, i) {
        super(r), this.errorType = e, this.fileName = t, this.lineNumber = i, this.communicationStatus = 0
    }
}

function def_val(e, r) {
    let t;
    return t = void 0 === e ? r : e, t
}

function bytes2hexs(e, r) {
    return r = def_val(r, " "), e.map((
        function(e) {
            let r = e.toString(16);
            return e < 16 && (r = "0" + r), r
        })).join(r).toUpperCase()
}

function array_tohexs(e, r, t) {
    let i;
    return i = array_slice(e, r = def_val(r, 0), t = def_val(t, e.length - r)), bytes2hexs(i, "")
}

function array_copy(e, r, t, i, a) {
    let o;
    for (i = def_val(i, 0), a = def_val(a, t.length), o = 0; o < a; o++) e[r + o] = t[i + o];
    return e
}

function array_slice(e, r, t) {
    let i;
    return i = [], array_copy(i, 0, e, r, t = def_val(t, e.length - r)), i
}

function array_compare(e, r, t, i, a) {
    let o;
    for (o = 0; o < a; o++) {
        if (void 0 === e[r + o]) return -1;
        if (void 0 === t[i + o]) return -1;
        if (e[r + o] != t[i + o]) return -1
    }
    return 0
}

function array_append(e, r, t, i) {
    let a;
    for (t = def_val(t, 0), i = def_val(i, r.length - t), a = 0; a < i; a++) e.push(r[t + a]);
    return e
}

function array_set_uint16l(e, r, t) {
    e[r] = 255 & t, e[r + 1] = t >> 8 & 255
}

function array_get_uint16l(e, r) {
    return e[r + 1] << 8 | e[r]
}

function array_get_uint32l(e, r) {
    return e[r + 3] << 24 | e[r + 2] << 16 | e[r + 1] << 8 | e[r]
}
var e = e || (() => {});

function enableDebugLog() {
    e = console.log
}

function wait_async(e) {
    return new Promise((r, t) => {
        setTimeout(r, e)
    })
}
class GenericUSB extends class CommunicationBase {
    async open() {}
    async transmit(e) {
        return 0
    }
    async receive(e, r) {
        return null
    }
    async clear() {}
    async close() {}
} {
    constructor() {
        super(), this._fileName = "GenericUSB.js", this.device = null, this.recv_buffer = [], this.receiver = null, this.max_packet_size = 0, this.receive_buffer_size = 0
    }
    get productId() {
        let e = null;
        return null != this.device && this.device.opened && (e = this.device.productId), e
    }
    get serialNumber() {
        let e = null;
        return null != this.device && this.device.opened && (e = String(this.device.serialNumber)), e
    }
    async open(r, t, i, a) {
        if (e("open begin"), null == this.device) {
            if (r && (this.device = await this.getPairedDevice(t, a)), null == this.device) try {
                let e = [];
                i.forEach(r => {
                    e.push({
                        vendorId: t,
                        productId: r
                    })
                }), this.device = await navigator.usb.requestDevice({
                    filters: e
                })
            } catch (r) {
                return e(r.message), Promise.reject(new NFCPortError(NFCPortError.DEVICE_NOT_FOUND, r.message, this._fileName, 70))
            }
            if (e(this.device.productName), e(this.device.manufacturerName), this.device.opened) {
                const r = "Already opened";
                return e(r), Promise.reject(new NFCPortError(NFCPortError.DEVICE_OPEN_ERROR, r, this._fileName, 81))
            }
            try {
                await this.device.open()
            } catch (r) {
                return this.device = null, e(r.message), Promise.reject(new NFCPortError(NFCPortError.DEVICE_OPEN_ERROR, r.message, this._fileName, 91))
            }
        } else e("open end (Already opened)")
    }
    async getPairedDevice(r, t) {
        let i, a = null;
        try {
            i = await navigator.usb.getDevices()
        } catch (r) {
            return e(r.message), Promise.reject(new NFCPortError(NFCPortError.DEVICE_NOT_FOUND, r.message, this._fileName, 104))
        }
        return null != i && i.length > 0 && i.forEach(i => {
            if (e("Paired Device vendorID: " + i.vendorId + " productID: " + i.productId), i.opened) e("device opened");
            else if (i.vendorId == r) {
                if (t.includes(i.productId)) return void(a = i);
                null == a && (a = i)
            }
        }), a
    }
    async setParameters(r, t, i, a, o) {
        if (e("setParameters begin"), null == this.device || !this.device.opened) {
            const r = "Device not opened";
            return e(r), Promise.reject(new NFCPortError(NFCPortError.DEVICE_OPEN_ERROR, r, this._fileName, 181))
        }
        try {
            let i, a = this.device.selectConfiguration(r).then(() => this.device.claimInterface(t)),
                o = new Promise(e => {
                    i = setTimeout(e, 1e3)
                }).then(() => {
                    const r = "claimInterface timeout";
                    return e(r), Promise.reject(new NFCPortError(NFCPortError.DEVICE_OPEN_ERROR, r, this._fileName, 154))
                });
            await Promise.race([a, o]), clearTimeout(i)
        } catch (r) {
            return this.close(), e(r.message), Promise.reject(new NFCPortError(NFCPortError.DEVICE_OPEN_ERROR, r.message, this._fileName, 163))
        }
        if (this.endno_out = i, this.endno_in = a, this.max_packet_size = this.get_max_packet_size(this.device, this.endno_out), 0 == this.max_packet_size) {
            this.close();
            const r = "USB endpoint not found";
            return e(r), Promise.reject(new NFCPortError(NFCPortError.DEVICE_OPEN_ERROR, r, this._fileName, 174))
        }
        this.receive_buffer_size = o, e("setParameters end")
    }
    get_max_packet_size(r, t) {
        e("get_max_packet_size begin");
        let i = 0,
            a = [];
        if (r.configuration.interfaces.forEach(e => {
                e.claimed && (a = e.alternate.endpoints.filter(e => e.endpointNumber == t))
            }), a.length > 0)
            for (let e of a) i = e.packetSize;
        else e("Error: endpoint cannot be found");
        return e("get_max_packet_size end"), i
    }
    async transmit(r) {
        let t, i;
        return e("transmit begin"), e("Send length : %d", r.length), e("Send : " + array_tohexs(r)), t = await this.device.transferOut(this.endno_out, Uint8Array.from(r)).then(t => "ok" != t.status ? (i = "transferOut Error", e(i), Promise.reject(new NFCPortError(NFCPortError.TRANSFER_ERROR, i, this._fileName, 230))) : r.length, r => (e(r.message), Promise.reject(new NFCPortError(NFCPortError.TRANSFER_ERROR, r.message, this._fileName, 238)))), 0 != this.max_packet_size ? t % this.max_packet_size == 0 && await this.device.transferOut(this.endno_out, Uint8Array.from([])).then(r => {
            if ("ok" != r.status) return i = "transferOut Error", e(i), Promise.reject(new NFCPortError(NFCPortError.TRANSFER_ERROR, i, this._fileName, 249))
        }, r => (e(r.message), Promise.reject(new NFCPortError(NFCPortError.TRANSFER_ERROR, r.message, this._fileName, 255)))) : e("Error: max_packet_size is 0"), e("transmit end"), t
    }
    get_buffer(r) {
        let t;
        return e("get_buffer begin"), this.recv_buffer.length >= r ? (t = array_slice(this.recv_buffer, 0, r), this.recv_buffer = array_slice(this.recv_buffer, r, this.recv_buffer.length - r)) : t = [], e("get_buffer end"), t
    }
    async receive(r, t) {
        let i, a, o, s, n, _, c, E, N;
        return e("receive begin (req_len=" + r + ", timeout=" + t + ")"), i = new Date, 0 != r && this.recv_buffer.length >= r ? (a = this.get_buffer(r), e("receive end(1)"), Promise.resolve(a)) : (o = !1, a = this.transferin().then(() => o ? (e("receive in canceled function"), []) : this.recv_buffer.length < r ? (n = new Date, _ = n.getTime() - i.getTime(), _ > t ? (s = "receive data receive timeout", e(s), Promise.reject(new NFCPortError(NFCPortError.DATA_RECEIVE_TIMEOUT, s, this._fileName, 324))) : this.receive(r, t - _)) : this.get_buffer(r), r => (e(r.message), Promise.reject(new NFCPortError(NFCPortError.TRANSFER_ERROR, r.message, this._fileName, 335)))), c = new Promise(e => {
            E = setTimeout(e, t)
        }).then(() => (o = !0, s = "receive data receive timeout", e(s), Promise.reject(new NFCPortError(NFCPortError.DATA_RECEIVE_TIMEOUT, s, this._fileName, 343)))), N = await Promise.race([a, c]), clearTimeout(E), e("receive end(2)"), N)
    }
    async transferin() {
        let r, t;
        if (e("transferin begin"), null == this.receiver) {
            if (e("receiver == null"), !this.device.opened) return this.receiver = null, r = "Device is closed.", e(r), Promise.reject(new NFCPortError(NFCPortError.TRANSFER_ERROR, r, this._fileName, 387));
            this.receiver = this.device.transferIn(this.endno_in, this.receive_buffer_size).then(i => (e("transferIn status : " + i.status), e("           data.byteLength : " + i.data.byteLength), "ok" != i.status || 0 == i.data.byteLength ? (r = "transferIn Error", e(r), Promise.reject(new NFCPortError(NFCPortError.TRANSFER_ERROR, r, this._fileName, 368))) : (t = function dataview_to_array(e) {
                let r, t;
                for (r = new Array(e.byteLength), t = 0; t < e.byteLength; t++) r[t] = e.getUint8(t);
                return r
            }(i.data), e("transferIn data : " + array_tohexs(t)), array_copy(this.recv_buffer, this.recv_buffer.length, t, 0, t.length), this.receiver = null, Promise.resolve())), r => (e(r.message), Promise.reject(new NFCPortError(NFCPortError.TRANSFER_ERROR, r.message, this._fileName, 381))))
        } else e("receiver != null");
        return e("transferin end"), this.receiver
    }
    async clear() {
        e("clear begin"), this.recv_buffer = [], e("clear end")
    }
    async close() {
        if (e("close begin"), null != this.device) {
            try {
                await this.device.close()
            } catch (r) {
                e(r.message)
            }
            this.device = null
        }
        e("close end")
    }
}
class TargetCard {
    constructor(e, r, t, i, a, o) {
        this.idm = e, this.pmm = r, this.uid = t, this.pupi = i, this.systemCode = a, this.baudRate = o
    }
}
const r = "ReaderWriterBase.js";
class ReaderWriterBase {
    static get DIAGNOSE_TESTNO_COMMUNICATION_LINE() {
        return 0
    }
    static get DIAGNOSE_TESTNO_ROM() {
        return 1
    }
    static get DIAGNOSE_TESTNO_RAM() {
        return 2
    }
    static get DIAGNOSE_TESTNO_POLLING() {
        return 3
    }
    static get DIAGNOSE_COMMUNICATION_LINE_SIZE_MIN() {
        return 1
    }
    static get DIAGNOSE_COMMUNICATION_LINE_SIZE_MAX() {
        return 500
    }
    static get DIAGNOSE_POLLING_COUNT_MIN() {
        return 1
    }
    static get DIAGNOSE_POLLING_COUNT_MAX() {
        return 255
    }
    static get BUFFER_CLEAR_TIMEOUT() {
        return 500
    }
    static get FELICA_CMD_POLLING() {
        return 0
    }
    static get FELICA_RES_POLLING() {
        return 1
    }
    static get FELICA_POLLING_TIMESLOT1() {
        return 0
    }
    static get FELICA_POLLING_TIMESLOT2() {
        return 1
    }
    static get FELICA_POLLING_TIMESLOT4() {
        return 3
    }
    static get FELICA_POLLING_TIMESLOT8() {
        return 7
    }
    static get FELICA_POLLING_TIMESLOT16() {
        return 15
    }
    static get FELICA_POLLING_OPTION_NONE() {
        return 0
    }
    static get FELICA_POLLING_OPTION_REQ_SYSCODE() {
        return 1
    }
    static get FELICA_POLLING_OPTION_REQ_BAUDRATE() {
        return 2
    }
    static get FELICA_POLLING_BAUDRATE_212K() {
        return 1
    }
    static get FELICA_POLLING_BAUDRATE_424K() {
        return 2
    }
    static get FELICA_POLLING_BAUDRATE_AUTO_DETECT() {
        return 128
    }
    static get PROTOCOL_ISO18092() {
        return "iso18092"
    }
    static get PROTOCOL_FELICA() {
        return "FeliCa"
    }
    static get PROTOCOL_ISO14443_3A() {
        return "iso14443-3A"
    }
    static get PROTOCOL_ISO14443_4A() {
        return "iso14443-4A"
    }
    static get PROTOCOL_ISO14443_4B() {
        return "iso14443-4B"
    }
    static get PROTOCOL_ISO15693() {
        return "iso15693"
    }
    static get DIAGNOSE_COMMUNICATION_LINE_TEST() {
        return "CommunicationLine"
    }
    static get DIAGNOSE_RAM_TEST() {
        return "RAM"
    }
    static get DIAGNOSE_ROM_TEST() {
        return "ROM"
    }
    static get DIAGNOSE_POLLING_TEST() {
        return "Polling"
    }
    static get DEVICE_TYPE_INTERNAL() {
        return "Internal"
    }
    static get DEVICE_TYPE_EXTERNAL() {
        return "External"
    }
    static get DEVICE_TYPE_UNKNOWN() {
        return "Unknown"
    }
    static get FELICA_DETECT_TIMEOUT() {
        return 100
    }
    static get DEFAULT_ACK_TIMEOUT() {
        return 1e3
    }
    static get DEFAULT_RECEIVE_TIMEOUT() {
        return 1500
    }
    static get COMMUNICATE_THRU_COMMAND_LENGTH_MAX() {
        return 290
    }
    static get COMMUNICATE_THRU_MIN_TIMEOUT() {
        return 400
    }
    static get COMMUNICATE_THRU_DEFAULT_TIMEOUT() {
        return 400
    }
    static get BAUDRATE_26K() {
        return 26
    }
    static get BAUDRATE_106K() {
        return 106
    }
    static get BAUDRATE_212K() {
        return 212
    }
    static get BAUDRATE_424K() {
        return 424
    }
    static get BAUDRATE_848K() {
        return 848
    }
    static get TYPEA_DEFAULT_FSDI() {
        return 8
    }
    static get TYPEA_DEFAULT_CID() {
        return 2
    }
    static get TYPEB_DEFAULT_FSDI() {
        return 8
    }
    static get TYPEB_DEFAULT_CID() {
        return 2
    }
    static getDeviceInfo(e, r) {
        let t = null;
        return e.forEach(e => {
            e.productId == r && (t = e)
        }), t
    }
    static hasProductId(e, r) {
        return null != ReaderWriterBase.getDeviceInfo(e, r)
    }
    constructor(e, r) {
        this.deviceName = r, this.targetCardBaudRate = null, this.serialNumber = null, this.deviceType = null, this.modelName = null, this.firmwareVersion = null, this.communicator = e, this.config = null, this.protocol = "", this.bAbnormalState = !1, this.isUpdateMode = !1
    }
    async init(t) {
        let i;
        if (e("init begin"), null == t) return i = "Parameter config is not specified", e(i), Promise.reject(new NFCPortError(NFCPortError.INVALID_PARAMETER, i, r, 127));
        this.config = t, this.protocol = "", this.bAbnormalState = !1, e("init end")
    }
    async open(t, i, a, o, s) {
        let n;
        if (null == this.config) return n = "not initialized", e(n), Promise.reject(new NFCPortError(NFCPortError.INTERNAL_ERROR, n, r, 147));
        if (this.bAbnormalState) return n = "Status is abnormaled", e(n), Promise.reject(new NFCPortError(NFCPortError.INTERNAL_ERROR, n, r, 155));
        this.protocol = "", this.bAbnormalState = !1, await this.communicator.setParameters(t, i, a, o, s), this.communicator.serialNumber ? this.serialNumber = this.communicator.serialNumber : (n = "device doesn't have iSerial ", e(n));
        const _ = this.getDeviceInfo(this.communicator.productId);
        this.modelName = _.modelName, this.deviceType = _.deviceType
    }
    async detectCard(t, i) {
        let a, o;
        if (e("detectCard begin"), this.bAbnormalState) return o = "Status is abnormaled", e(o), Promise.reject(new NFCPortError(NFCPortError.INTERNAL_ERROR, o, r, 184));
        if (t == ReaderWriterBase.PROTOCOL_ISO18092 || t == ReaderWriterBase.PROTOCOL_FELICA) this.protocol = ReaderWriterBase.PROTOCOL_ISO18092, a = await this.detectCard_FeliCa(i);
        else if (t == ReaderWriterBase.PROTOCOL_ISO14443_3A) this.protocol = ReaderWriterBase.PROTOCOL_ISO14443_3A, a = await this.detectCard_TypeA(i);
        else if (t == ReaderWriterBase.PROTOCOL_ISO14443_4A) this.protocol = ReaderWriterBase.PROTOCOL_ISO14443_4A, a = await this.detectCard_TypeA(i);
        else if (t == ReaderWriterBase.PROTOCOL_ISO14443_4B) this.protocol = ReaderWriterBase.PROTOCOL_ISO14443_4B, a = await this.detectCard_TypeB(i);
        else {
            if (t != ReaderWriterBase.PROTOCOL_ISO15693) return o = "Invalid parameter (protocol)", e(o), Promise.reject(new NFCPortError(NFCPortError.INVALID_PARAMETER, o, r, 205));
            this.protocol = ReaderWriterBase.PROTOCOL_ISO15693, a = await this.detectCard_TypeV(i)
        }
        return e("detectCard end"), a
    }
    async communicateThru(t, i, a) {
        let o, s;
        if (e("communicateThru begin"), this.bAbnormalState) return o = "Status is abnormaled", e(o), Promise.reject(new NFCPortError(NFCPortError.INTERNAL_ERROR, o, r, 221));
        if ((this.protocol != ReaderWriterBase.PROTOCOL_ISO14443_3A || null == a || !a.mifareAuthentication) && (null == t || t.length <= 0)) return o = "Invalid parameter (command)", e(o), Promise.reject(new NFCPortError(NFCPortError.INVALID_PARAMETER, o, r, 228));
        if (null != t && t.length > ReaderWriterBase.COMMUNICATE_THRU_COMMAND_LENGTH_MAX) return o = "The command is incorrect size.", e(o), Promise.reject(new NFCPortError(NFCPortError.INVALID_PARAMETER, o, r, 232));
        if (this.protocol == ReaderWriterBase.PROTOCOL_ISO14443_3A && null != a && a.mifareAuthentication) {
            if (null == a.key || 6 != a.key.length) return o = "Invalid key length", e(o), Promise.reject(new NFCPortError(NFCPortError.INVALID_PARAMETER, o, r, 243));
            if ("KeyA" != a.keyType && "KeyB" != a.keyType) return o = "Invalid keyType", e(o), Promise.reject(new NFCPortError(NFCPortError.INVALID_PARAMETER, o, r, 247));
            if (a.blockNumber < 0 || a.blockNumber > 255) return o = "Invalid blockNumber", e(o), Promise.reject(new NFCPortError(NFCPortError.INVALID_PARAMETER, o, r, 251));
            if (null == a.uid || 0 == a.uid.length) return o = "Invalid uid", e(o), Promise.reject(new NFCPortError(NFCPortError.INVALID_PARAMETER, o, r, 255));
            await this.typea_mifareAuth(a)
        }
        return s = await this.sendThruCommand(t, i, a), e("communicateThru end"), s
    }
    async switchRF(t) {
        let i;
        return e("switchRF begin"), this.bAbnormalState ? (i = "Status is abnormaled", e(i), Promise.reject(new NFCPortError(NFCPortError.INTERNAL_ERROR, i, r, 281))) : null == t ? (i = "Invalid parameter (on)", e(i), Promise.reject(new NFCPortError(NFCPortError.INTERNAL_ERROR, i, r, 287))) : (t ? await this.rf_on() : await this.rf_off(), void e("switchRF end"))
    }
    async close() {
        e("close begin");
        try {
            await this.communicator.close()
        } catch (e) {}
        this.deviceName = null, this.targetCardBaudRate = null, this.serialNumber = null, this.protocol = "", this.bAbnormalState = !1, this.isUpdateMode = !1, e("close end")
    }
    async diagnose(t, i, a) {
        let o;
        if (e("diagnose begin"), this.bAbnormalState) return o = "Status is abnormaled", e(o), Promise.reject(new NFCPortError(NFCPortError.INTERNAL_ERROR, o, r, 331));
        switch (t) {
            case ReaderWriterBase.DIAGNOSE_COMMUNICATION_LINE_TEST:
                if (null == i) return o = "Parameter is not specified.", e(o), Promise.reject(new NFCPortError(NFCPortError.INVALID_PARAMETER, o, r, 339));
                if ("object" != typeof i || "Uint8Array" != i.constructor.name) return o = "Parameter is incorrect type.", e(o), Promise.reject(new NFCPortError(NFCPortError.INVALID_PARAMETER, o, r, 343));
                if (i.length > ReaderWriterBase.DIAGNOSE_COMMUNICATION_LINE_SIZE_MAX) return o = "parameter is incorrect size.", e(o), Promise.reject(new NFCPortError(NFCPortError.INVALID_PARAMETER, o, r, 347));
                break;
            case ReaderWriterBase.DIAGNOSE_ROM_TEST:
            case ReaderWriterBase.DIAGNOSE_RAM_TEST:
                break;
            case ReaderWriterBase.DIAGNOSE_POLLING_TEST:
                if (null == i) return o = "Parameter is not specified.", e(o), Promise.reject(new NFCPortError(NFCPortError.INVALID_PARAMETER, o, r, 360));
                if ("string" != typeof i) return o = "Parameter is incorrect type.", e(o), Promise.reject(new NFCPortError(NFCPortError.INVALID_PARAMETER, o, r, 364));
                if (null == a) return o = "Parameter is not specified.", e(o), Promise.reject(new NFCPortError(NFCPortError.INVALID_PARAMETER, o, r, 368));
                if ("number" != typeof a) return o = "Parameter is incorrect type.", e(o), Promise.reject(new NFCPortError(NFCPortError.INVALID_PARAMETER, o, r, 372));
                if (a < ReaderWriterBase.DIAGNOSE_POLLING_COUNT_MIN || ReaderWriterBase.DIAGNOSE_POLLING_COUNT_MAX < a) return o = "Parameter is out of range", e(o), Promise.reject(new NFCPortError(NFCPortError.INVALID_PARAMETER, o, r, 376));
                break;
            default:
                return o = "Parameter is not specified.", e(o), Promise.reject(new NFCPortError(NFCPortError.INVALID_PARAMETER, o, r, 384))
        }
        const s = await this.self_diagnose(t, i, a);
        return e("diagnose end"), s
    }
    async prepareUpdateFirmware(e) {}
    async updateFirmware(e, r) {}
    async resetDevice(e) {}
    async getFirmwareVersion() {}
    async getModelID() {}
    async startRFFEParameterMode() {}
    async endRFFEParameterMode() {}
    async readRFFEParameter(e, r, t) {}
    async writeRFFEParameter(e, r, t) {}
    async detectCard_FeliCa(t) {
        let i, a, o, s, n, _, c, E, N;
        if (e("detectCard_FeliCa begin"), null == t || null == t.systemCode || 2 != t.systemCode.length || null == t.timeSlot || t.timeSlot != ReaderWriterBase.FELICA_POLLING_TIMESLOT1 && t.timeSlot != ReaderWriterBase.FELICA_POLLING_TIMESLOT2 && t.timeSlot != ReaderWriterBase.FELICA_POLLING_TIMESLOT4 && t.timeSlot != ReaderWriterBase.FELICA_POLLING_TIMESLOT8 && t.timeSlot != ReaderWriterBase.FELICA_POLLING_TIMESLOT16 || null == t.requestSystemCode || null == t.requestBaudRate || t.requestSystemCode && t.requestBaudRate) return i = "Invalid parameter (option)", e(i), Promise.reject(new NFCPortError(NFCPortError.INVALID_PARAMETER, i, r, 427));
        await this.setFeliCaProtocol(), a = [6, ReaderWriterBase.FELICA_CMD_POLLING, t.systemCode[0], t.systemCode[1], 0, 0], t.requestSystemCode ? a[4] = ReaderWriterBase.FELICA_POLLING_OPTION_REQ_SYSCODE : t.requestBaudRate || this.config.autoBaudRate ? a[4] = ReaderWriterBase.FELICA_POLLING_OPTION_REQ_BAUDRATE : a[4] = ReaderWriterBase.FELICA_POLLING_OPTION_NONE, null != t && null != t.timeSlot && (a[5] = t.timeSlot);
        try {
            o = await this.sendFeliCaPolling(a, ReaderWriterBase.FELICA_DETECT_TIMEOUT)
        } catch (e) {
            return e.errorType == NFCPortError.THRU_RESPONSE_PACKET_NOT_RECEIVED && (e.errorType = NFCPortError.CARD_NOT_DETECTED, e.message = "Card not detected"), Promise.reject(e)
        }
        return o.length < 18 ? (i = "Illegal polling response length", e(i), Promise.reject(new NFCPortError(NFCPortError.INVALID_RESPONSE, i, r, 459))) : (s = o.length >= 20 ? array_slice(o, 18, 2) : [], a[4] == ReaderWriterBase.FELICA_POLLING_OPTION_REQ_SYSCODE ? (n = s, _ = null) : a[4] == ReaderWriterBase.FELICA_POLLING_OPTION_REQ_BAUDRATE ? (n = null, _ = s) : (n = null, _ = null), c = t.requestSystemCode ? new Uint8Array(n) : null, E = t.requestBaudRate ? new Uint8Array(_) : null, N = new TargetCard(new Uint8Array(array_slice(o, 2, 8)), new Uint8Array(array_slice(o, 10, 8)), null, null, c, E, null, null), e("IDm :" + array_tohexs(N.idm)), e("PMm :" + array_tohexs(N.pmm)), null != N.systemCode && e("SystemCode :" + array_tohexs(N.systemCode)), this.targetCardBaudRate = ReaderWriterBase.BAUDRATE_212K, this.config.autoBaudRate && await this.setFeliCaSpeed(a, _), e("detectCard_FeliCa end"), N)
    }
    async setFeliCaProtocol() {}
    async sendFeliCaPolling(e, r) {}
    async setFeliCaSpeed(e, r) {}
    async typea_mifareAuth(e) {}
    async sendThruCommand(e, r, t) {}
    async rf_on() {}
    async rf_off() {}
    async self_diagnose(e, r, t) {}
    getDeviceInfo(e) {}
}
class DetectionOption {
    static get SYSCODE_DEFAULT() {
        return new Uint8Array([255, 255])
    }
    static get TIMESLOT_DEFAULT() {
        return 0
    }
    static get REQUEST_SYSCODE_DEFAULT() {
        return !0
    }
    static get REQUEST_BAUDRATE_DEFAULT() {
        return !1
    }
    constructor(e, r, t, i, a, o) {
        this.systemCode = null != e ? e : DetectionOption.SYSCODE_DEFAULT, this.timeSlot = null != r ? r : DetectionOption.TIMESLOT_DEFAULT, this.requestSystemCode = null != t ? t : DetectionOption.REQUEST_SYSCODE_DEFAULT, this.requestBaudRate = null != i ? i : DetectionOption.REQUEST_BAUDRATE_DEFAULT, this.fsdi = a, this.cid = o
    }
}

function TypebCard(e, r, t) {
    this.pupi = e, this.application_data = r, this.protocol_info = t
}

function ISO14443_4_CC_UNIT_MS(e) {
    return (e + 13560 - 1) / 13560
}

function ISO14443_4_CC_FWT(e) {
    return ISO14443_4_CC_UNIT_MS(4096 * (1 << e))
}
const t = ISO14443_4_CC_UNIT_MS(1152) + ISO14443_4_CC_UNIT_MS(84),
    i = ISO14443_4_CC_UNIT_MS(16);
class NFCPort100 extends ReaderWriterBase {
    static get DEVICE_INFO_LIST() {
        return [{
            productId: 1729,
            modelName: "RC-S380/S",
            deviceType: "External"
        }, {
            productId: 1731,
            modelName: "RC-S380/P",
            deviceType: "External"
        }]
    }
    static getDeviceInfo(e) {
        return ReaderWriterBase.getDeviceInfo(NFCPort100.DEVICE_INFO_LIST, e)
    }
    static hasProductId(e) {
        return ReaderWriterBase.hasProductId(NFCPort100.DEVICE_INFO_LIST, e)
    }
    static get SELECT_CONFIG() {
        return 1
    }
    static get CLAIM_INTERFACE() {
        return 0
    }
    static get ENDPOINT_IN() {
        return 1
    }
    static get ENDPOINT_OUT() {
        return 2
    }
    static get COMMAND_TYPE_0() {
        return 0
    }
    static get COMMAND_TYPE_1() {
        return 1
    }
    static get NFC100_COMMAND_CODE() {
        return 214
    }
    static get NFC100_RESPONSE_CODE() {
        return 215
    }
    static get SCC_SET_COMMAND_TYPE() {
        return 42
    }
    static get SRC_SET_COMMAND_TYPE() {
        return 43
    }
    static get SCC_IN_SET_RF() {
        return 0
    }
    static get SRC_IN_SET_RF() {
        return 1
    }
    static get SCC_IN_SET_PROTOCOL() {
        return 2
    }
    static get SRC_IN_SET_PROTOCOL() {
        return 3
    }
    static get SCC_IN_COMM_RF() {
        return 4
    }
    static get SRC_IN_COMM_RF() {
        return 5
    }
    static get SCC_SWITCH_RF() {
        return 6
    }
    static get SRC_SWITCH_RF() {
        return 7
    }
    static get SCC_GET_FIRMWARE_VERSION() {
        return 32
    }
    static get SRC_GET_FIRMWARE_VERSION() {
        return 33
    }
    static get SCC_GET_PDDATA_VERSION() {
        return 34
    }
    static get SRC_GET_PDDATA_VERSION() {
        return 35
    }
    static get SCC_GET_PROPERTY() {
        return 36
    }
    static get SRC_GET_PROPERTY() {
        return 37
    }
    static get SCC_IN_SET_RCT() {
        return 48
    }
    static get SRC_IN_SET_RCT() {
        return 49
    }
    static get SCC_IN_GET_RCT() {
        return 50
    }
    static get SRC_IN_GET_RCT() {
        return 51
    }
    static get SCC_READ_REGISTER() {
        return 54
    }
    static get SRC_READ_REGISTER() {
        return 55
    }
    static get SCC_DIAGNOSE() {
        return 240
    }
    static get SRC_DIAGNOSE() {
        return 241
    }
    static get STATUS_SUCCESS() {
        return 0
    }
    static get STATUS_PARAMETER_ERROR() {
        return 1
    }
    static get STATUS_PB_ERROR() {
        return 2
    }
    static get STATUS_RFCA_ERROR() {
        return 3
    }
    static get STATUS_TEMPERATURE_ERROR() {
        return 4
    }
    static get STATUS_PWD_ERROR() {
        return 5
    }
    static get STATUS_RECEIVE_ERROR() {
        return 6
    }
    static get STATUS_COMMANDTYPE_ERROR() {
        return 7
    }
    static get STATUS_INTTEMPRFOFF_ERROR() {
        return 9
    }
    static get COM_STATUS_PROTOCOL_ERROR() {
        return 1
    }
    static get COM_STATUS_PARITY_ERROR() {
        return 2
    }
    static get COM_STATUS_CRC_ERROR() {
        return 4
    }
    static get COM_STATUS_COLLISION_ERROR() {
        return 8
    }
    static get COM_STATUS_OVERFLOW_ERROR() {
        return 16
    }
    static get COM_STATUS_TEMPERATURE_ERROR() {
        return 64
    }
    static get COM_STATUS_REC_TIMEOUT_ERROR() {
        return 128
    }
    static get COM_STATUS_CRYPTO1_ERROR() {
        return 256
    }
    static get COM_STATUS_RFCA_ERROR() {
        return 512
    }
    static get COM_STATUS_INTTEMPRFOFF_ERROR() {
        return 4096
    }
    static get SWITCH_RF_RFON() {
        return 1
    }
    static get SWITCH_RF_RFOFF() {
        return 0
    }
    static get REG_ADR_RF_STATE() {
        return 20
    }
    static get REG_ADR_RF_STATE_ON() {
        return 131
    }
    static get REG_ADR_RF_STATE_OFF() {
        return 128
    }
    static get NFC100_MAX_SWICH_RF_RETRY_COUNT() {
        return 3
    }
    static get NFC100_MAX_SWICH_RF_EXECUTION_COUNT() {
        return NFCPort100.NFC100_MAX_SWICH_RF_RETRY_COUNT + 1
    }
    static get DIAGNOSE_TIMEOUT_COMMUNICATION_LINE_TEST() {
        return 1e3
    }
    static get DIAGNOSE_TIMEOUT_ROM_TEST() {
        return 1e3
    }
    static get DIAGNOSE_TIMEOUT_RAM_TEST() {
        return 1e3
    }
    static get DIAGNOSE_TIMEOUT_POLLING_TEST() {
        return 1e3
    }
    static get DIAGNOSE_TIMEOUT_RF_REGULATION_TEST() {
        return 1e3
    }
    static get DIAGNOSE_TIMEOUT_GET_UPDATE_SUCCESS_COUNT() {
        return 1e3
    }
    static get DIAGNOSE_TIMEOUT_OUTPUT_TRIGGER_SIGNAL() {
        return 1e3
    }
    static get DIAGNOSE_TIMEOUT_TEMP_ABNORMAL_MEMORY_MANAGE() {
        return 1e3
    }
    static get NFC100_RBT_INITIATOR_ISO18092_212K() {
        return 1
    }
    static get NFC100_RBT_INITIATOR_ISO18092_424K() {
        return 1
    }
    static get NFC100_RBT_INITIATOR_ISO14443A_106K() {
        return 2
    }
    static get NFC100_RBT_INITIATOR_ISO14443B_106K() {
        return 3
    }
    static get NFC100_RBT_INITIATOR_ISO14443B_212K() {
        return 3
    }
    static get NFC100_RBT_INITIATOR_ISO14443B_424K() {
        return 3
    }
    static get NFC100_RBT_INITIATOR_ISO14443B_848K() {
        return 3
    }
    static get NFC100_RBT_INITIATOR_ISO14443A_212K() {
        return 4
    }
    static get NFC100_RBT_INITIATOR_ISO14443A_424K() {
        return 5
    }
    static get NFC100_RBT_INITIATOR_ISO14443A_848K() {
        return 6
    }
    static get NFC100_RF_INITIATOR_ISO18092_212K() {
        return 1
    }
    static get NFC100_RF_INITIATOR_ISO18092_424K() {
        return 2
    }
    static get NFC100_RF_INITIATOR_ISO18092_106K() {
        return 3
    }
    static get NFC100_RF_INITIATOR_ISO14443A_106K() {
        return 3
    }
    static get NFC100_RF_INITIATOR_ISO14443A_212K() {
        return 4
    }
    static get NFC100_RF_INITIATOR_ISO14443A_424K() {
        return 5
    }
    static get NFC100_RF_INITIATOR_ISO14443A_848K() {
        return 6
    }
    static get NFC100_RF_INITIATOR_ISO14443B_106K() {
        return 7
    }
    static get NFC100_RF_INITIATOR_ISO14443B_212K() {
        return 8
    }
    static get NFC100_RF_INITIATOR_ISO14443B_424K() {
        return 9
    }
    static get NFC100_RF_INITIATOR_ISO14443B_848K() {
        return 10
    }
    static get NFC100_IN_SET_RCT_SETTING_NUM_MAX() {
        return 16
    }
    static get RF_NOISE_RESISTANT_IMPROVEMENT() {
        return [26, 192, 64]
    }
    static get ACK_CMD() {
        return [0, 0, 255, 0, 255, 0]
    }
    static get WAIT_AFTER_SEND_ACK() {
        return 5
    }
    static get felica_default_protocol() {
        return [0, 21, 1, 1, 2, 1, 3, 0, 4, 0, 5, 0, 6, 0, 7, 8, 8, 0, 9, 0, 10, 0, 11, 0, 12, 0, 14, 0, 15, 5, 16, 255, 17, 0, 18, 0, 19, 6]
    }
    static get NFC100_TYPEA_CMD_REQA() {
        return 38
    }
    static get NFC100_TYPEA_CMD_WUPA() {
        return 82
    }
    static get NFC100_TYPEA_CMD_HLTA() {
        return 80
    }
    static get NFC100_TYPEA_CMD_SEL_CL_1() {
        return 147
    }
    static get NFC100_TYPEA_CMD_SEL_CL_2() {
        return 149
    }
    static get NFC100_TYPEA_CMD_SEL_CL_3() {
        return 151
    }
    static get NFC100_TYPEA_CMD_PPS() {
        return 208
    }
    static get typea_default_protocol() {
        return [0, 6, 1, 1, 2, 1, 3, 0, 4, 1, 5, 1, 6, 0, 7, 8, 8, 0, 9, 0, 10, 0, 11, 0, 12, 0, 14, 4, 15, 0, 16, 0, 17, 0, 18, 0, 19, 6]
    }
    static get NFC100_TYPEB_CMD_REQB() {
        return 5
    }
    static get NFC100_TYPEB_CMD_HLTB() {
        return 80
    }
    static get NFC100_TYPEB_CMD_ATTRIB() {
        return 29
    }
    static get TYPEB_CARD_MAX_ATTRIB_LEN() {
        return 256
    }
    static get typeb_default_protocol() {
        return [0, 20, 1, 1, 2, 1, 3, 0, 4, 0, 5, 0, 6, 0, 7, 8, 8, 0, 9, 1, 10, 1, 11, 1, 12, 1, 14, 4, 15, 0, 16, 0, 17, 0, 18, 0, 19, 6]
    }
    static get ISO14443_4_CC_DEFAULT_SFGI() {
        return 14
    }
    static get LT_INFO_TABLE() {
        return [
            [0, 0, 1, 1, 139, 91, 9, 236, 122, 221, 197, 129, 0, 151, 75, 95, 164, 118, 161, 213],
            [0, 1, 1, 0, 213, 159, 243, 133, 168, 199, 47, 105, 44, 65, 173, 1, 230, 180, 145, 103],
            [0, 6, 1, 0, 106, 206, 150, 130, 181, 221, 246, 214, 152, 205, 55, 232, 219, 31, 152, 186],
            [0, 8, 1, 0, 71, 212, 66, 85, 79, 225, 65, 241, 115, 21, 127, 202, 181, 114, 86, 210]
        ]
    }
    static get NFC100_RR_INFO() {
        return [15, 30, 45, 60, 75, 90, 105, 123, 135, 150, 165, 180, 195, 210, 225, 240]
    }
    static get MAX_RESPONSE_PACKET_SIZE() {
        return 13 + ReaderWriterBase.DIAGNOSE_COMMUNICATION_LINE_SIZE_MAX
    }
    constructor(e) {
        super(e, "NFCPort100"), this._fileName = "NFCPort100.js", this.currentProtocol = new Array(NFCPort100.felica_default_protocol.length / 2 + 1)
    }
    async open() {
        e("open begin"), await super.open(NFCPort100.SELECT_CONFIG, NFCPort100.CLAIM_INTERFACE, NFCPort100.ENDPOINT_OUT, NFCPort100.ENDPOINT_IN, NFCPort100.MAX_RESPONSE_PACKET_SIZE);
        try {
            await this.send_ack();
            try {
                await this.SetCommandType(NFCPort100.COMMAND_TYPE_1)
            } catch (e) {
                if (e.errorType != NFCPortError.INVALID_STATUS) return Promise.reject(e);
                await this.SetCommandType(NFCPort100.COMMAND_TYPE_0)
            }
            await this.set_felica_rf_speed_and_protocol(ReaderWriterBase.BAUDRATE_212K), this.protocol = ReaderWriterBase.PROTOCOL_FELICA, await this.rf_on();
            const r = 30,
                t = await this.GetProperty(),
                i = t[r];
            let a;
            1 == i ? a = ReaderWriterBase.DEVICE_TYPE_INTERNAL : 2 == i ? a = ReaderWriterBase.DEVICE_TYPE_EXTERNAL : (e("can't get deviceType from property"), a = ReaderWriterBase.DEVICE_TYPE_UNKNOWN), this.deviceType != a && e("device returns other devicetype"), this.deviceType = a;
            const o = await this.GetFirmwareVersion(),
                s = o[0].toString(16),
                n = o[1].toString(16);
            this.firmwareVersion = s + "." + n, this.serialNumber = "";
            for (let e = 22; e < 30; e++) this.serialNumber += ("00" + t[e].toString(16).toUpperCase()).substr(-2)
        } catch (r) {
            return this.close(), e("open end"), Promise.reject(r)
        }
        e("open end")
    }
    async detectCard(r, t) {
        e("detectCard begin");
        let i = await super.detectCard(r, t);
        return e("detectCard end"), i
    }
    async communicateThru(r, t, i) {
        e("communicateThru begin");
        let a = await super.communicateThru(r, t, i);
        return e("communicateThru end"), a
    }
    async switchRF(r) {
        e("switchRF begin"), await super.switchRF(r), e("switchRF end")
    }
    async close() {
        if (e("close begin"), !this.bAbnormalState) try {
            await this.rf_off()
        } catch (e) {}
        await super.close(), e("close end")
    }
    async prepareUpdateFirmware(r) {
        const t = "prepareUpdateFirmware is not supported";
        return e(t), Promise.reject(new NFCPortError(NFCPortError.API_NOT_SUPPORTED, t, this._fileName, 379))
    }
    async updateFirmware(r, t) {
        const i = "updateFirmware is not supported";
        return e(i), Promise.reject(new NFCPortError(NFCPortError.API_NOT_SUPPORTED, i, this._fileName, 385))
    }
    async resetDevice(r) {
        const t = "resetDeviceis not supported";
        return e(t), Promise.reject(new NFCPortError(NFCPortError.API_NOT_SUPPORTED, t, this._fileName, 390))
    }
    async getFirmwareVersion() {
        const r = "getFirmwareVersion is not supported";
        return e(r), Promise.reject(new NFCPortError(NFCPortError.API_NOT_SUPPORTED, r, this._fileName, 395))
    }
    async getModelID() {
        const r = "getModelID is not supported";
        return e(r), Promise.reject(new NFCPortError(NFCPortError.API_NOT_SUPPORTED, r, this._fileName, 400))
    }
    async startRFFEParameterMode() {
        const r = "startRFFEParameterMode is not supported";
        return e(r), Promise.reject(new NFCPortError(NFCPortError.API_NOT_SUPPORTED, r, this._fileName, 405))
    }
    async endRFFEParameterMode() {
        const r = "endRFFEParameterMode is not supported";
        return e(r), Promise.reject(new NFCPortError(NFCPortError.API_NOT_SUPPORTED, r, this._fileName, 410))
    }
    async readRFFEParameter(r, t, i) {
        const a = "readRFFEParameter is not supported";
        return e(a), Promise.reject(new NFCPortError(NFCPortError.API_NOT_SUPPORTED, a, this._fileName, 415))
    }
    async writeRFFEParameter(r, t, i) {
        const a = "writeRFFEParameter is not supported";
        return e(a), Promise.reject(new NFCPortError(NFCPortError.API_NOT_SUPPORTED, a, this._fileName, 420))
    }
    async setFeliCaProtocol() {
        await this.set_felica_rf_speed_and_protocol(ReaderWriterBase.BAUDRATE_212K), await this.rf_on()
    }
    async sendFeliCaPolling(e, r) {
        return await this.InCommRF(e, r)
    }
    async setFeliCaSpeed(e, r) {
        if (e[4] != ReaderWriterBase.FELICA_POLLING_OPTION_REQ_BAUDRATE) {
            let t;
            e[4] = ReaderWriterBase.FELICA_POLLING_OPTION_REQ_BAUDRATE;
            try {
                t = await this.sendFeliCaPolling(e, ReaderWriterBase.FELICA_DETECT_TIMEOUT)
            } catch (e) {
                return e.errorType == NFCPortError.THRU_RESPONSE_PACKET_NOT_RECEIVED && (e.errorType = NFCPortError.CARD_NOT_DETECTED, e.message = "Card not detected"), Promise.reject(e)
            }
            t.length >= 20 && (r = array_slice(t, 18, 2))
        }
        null != r && 2 == r.length && 0 != (r[1] & ReaderWriterBase.FELICA_POLLING_BAUDRATE_AUTO_DETECT) && 0 != (r[1] & ReaderWriterBase.FELICA_POLLING_BAUDRATE_424K) && await this.set_felica_rf_speed_and_protocol(ReaderWriterBase.BAUDRATE_424K)
    }
    async detectCard_TypeA(r) {
        let t, i, a, o, s, n, _, c, E;
        return e("detectCard_TypeA begin"), t = NFCPort100.NFC100_RBT_INITIATOR_ISO14443A_106K, i = NFCPort100.NFC100_RF_INITIATOR_ISO14443A_106K, a = NFCPort100.NFC100_RBT_INITIATOR_ISO14443A_106K, o = NFCPort100.NFC100_RF_INITIATOR_ISO14443A_106K, await this.InSetRF(t, i, a, o), await this.InSetProtocol(NFCPort100.typea_default_protocol), this.targetCardBaudRate = ReaderWriterBase.BAUDRATE_106K, await this.rf_on(), s = await this.typea_reqa_wupa(), n = await this.typea_anticollision(), null != n && (n = new Uint8Array(n)), this.protocol == ReaderWriterBase.PROTOCOL_ISO14443_4A && (_ = null != r.fsdi ? r.fsdi : ReaderWriterBase.TYPEA_DEFAULT_FSDI, c = null != r.cid ? r.cid : ReaderWriterBase.TYPEA_DEFAULT_CID, await this.typea_iso14443_4_activate(_, c, this.config.autoBaudRate)), await this.InSetProtocol(NFCPort100.typea_default_protocol), E = new TargetCard(null, null, n, null, null, null), e("detectCard_TypeA end"), E
    }
    async detectCard_TypeB(r) {
        let t, i, a, o, s, n, _, c, E, N, l, P, C, R;
        return e("detectCard_TypeB begin"), t = NFCPort100.NFC100_RBT_INITIATOR_ISO14443B_106K, i = NFCPort100.NFC100_RF_INITIATOR_ISO14443B_106K, a = NFCPort100.NFC100_RBT_INITIATOR_ISO14443B_106K, o = NFCPort100.NFC100_RF_INITIATOR_ISO14443B_106K, await this.InSetRF(t, i, a, o), await this.InSetProtocol(NFCPort100.typeb_default_protocol), this.targetCardBaudRate = 106, await this.rf_on(), s = 0, n = !0, _ = !1, c = !1, E = await this.typeb_reqb_wupb(0, true, false, false), 0 != (1 & E.protocol_info[1]) && (N = null != r.fsdi ? r.fsdi : ReaderWriterBase.TYPEB_DEFAULT_FSDI, l = null != r.cid ? r.cid : ReaderWriterBase.TYPEB_DEFAULT_CID, P = null, await this.typeb_iso14443_4_activate(E.pupi, N, E.protocol_info, l, null, this.config.autoBaudRate)), await this.InSetProtocol(NFCPort100.typeb_default_protocol), C = null != E.pupi ? new Uint8Array(E.pupi) : null, R = new TargetCard(null, null, null, C, null, null), e("detectCard_TypeB end"), R
    }
    async detectCard_TypeV(e) {
        return Promise.reject(new NFCPortError(NFCPortError.INVALID_PARAMETER, "unsupoorted protocol", this._fileName, 605))
    }
    async sendThruCommand(e, r, t) {
        let i;
        if (await this.setCommunicateThruProtocol(t), null != e && e.length > 0) {
            r < ReaderWriterBase.COMMUNICATE_THRU_MIN_TIMEOUT && (r = ReaderWriterBase.COMMUNICATE_THRU_MIN_TIMEOUT);
            let t = await this.InCommRF(e, r);
            i = new Uint8Array(t)
        } else i = null;
        return i
    }
    async rf_on() {
        let r, t;
        for (e("rf_on begin"), r = 0; r < NFCPort100.NFC100_MAX_SWICH_RF_EXECUTION_COUNT; r++) {
            await this.SwitchRF(NFCPort100.SWITCH_RF_RFON);
            try {
                if (t = await this.ReadRegister(NFCPort100.NFC100_RR_INFO, NFCPort100.REG_ADR_RF_STATE), t == NFCPort100.REG_ADR_RF_STATE_ON) break
            } catch (e) {}
        }
        r >= NFCPort100.NFC100_MAX_SWICH_RF_EXECUTION_COUNT ? e("rf_on Failed") : e("rf_on end")
    }
    async rf_off() {
        let r, t;
        for (e("rf_off begin"), r = 0; r < NFCPort100.NFC100_MAX_SWICH_RF_EXECUTION_COUNT; r++) {
            await this.SwitchRF(NFCPort100.SWITCH_RF_RFOFF);
            try {
                if (t = await this.ReadRegister(NFCPort100.NFC100_RR_INFO, NFCPort100.REG_ADR_RF_STATE), t == NFCPort100.REG_ADR_RF_STATE_OFF) break
            } catch (e) {}
            r < NFCPort100.NFC100_MAX_SWICH_RF_EXECUTION_COUNT - 1 && await this.SwitchRF(NFCPort100.SWITCH_RF_RFON)
        }
        r >= NFCPort100.NFC100_MAX_SWICH_RF_EXECUTION_COUNT ? e("rf_off Failed") : e("rf_off end")
    }
    async self_diagnose(r, t, i) {
        let a;
        return e("self_diagnose begin"), a = r == ReaderWriterBase.DIAGNOSE_POLLING_TEST ? await this.DiagnosePollingTest(t, i) : await this.Diagnose(r, t), e("self_diagnose end"), a
    }
    async send_ack() {
        e("send_ack begin"), await this.communicator.clear(), await this.communicator.transmit(NFCPort100.ACK_CMD), await wait_async(NFCPort100.WAIT_AFTER_SEND_ACK), e("send_ack end")
    }
    async set_felica_rf_speed_and_protocol(r) {
        let t, i, a, o, s, n, _;
        e("set_felica_rf_speed begin"), null != r && r == ReaderWriterBase.BAUDRATE_424K ? (t = NFCPort100.NFC100_RBT_INITIATOR_ISO18092_424K, i = NFCPort100.NFC100_RF_INITIATOR_ISO18092_424K, a = NFCPort100.NFC100_RBT_INITIATOR_ISO18092_424K, o = NFCPort100.NFC100_RF_INITIATOR_ISO18092_424K) : (r = ReaderWriterBase.BAUDRATE_212K, t = NFCPort100.NFC100_RBT_INITIATOR_ISO18092_212K, i = NFCPort100.NFC100_RF_INITIATOR_ISO18092_212K, a = NFCPort100.NFC100_RBT_INITIATOR_ISO18092_212K, o = NFCPort100.NFC100_RF_INITIATOR_ISO18092_212K), await this.InSetRF(t, i, a, o);
        try {
            s = await this.get_lt_info(), null != s && (n = await this.InGetRCT(s), null != n && (_ = await this.update_rct_setting(n.in_receive_setting, NFCPort100.RF_NOISE_RESISTANT_IMPROVEMENT), null != _ && await this.InSetRCT(s, n.in_send_setting, n.in_receive_setting)))
        } catch (e) {}
        await this.InSetProtocol(NFCPort100.felica_default_protocol), this.targetCardBaudRate = r, e("set_felica_rf_speed end")
    }
    async receive_ack(r) {
        let t, i, a, o, s, n;
        for (e("receive_ack begin (timeout=" + r + ")"), t = new Date, i = [];;) {
            if (o = new Date, s = o.getTime() - t.getTime(), s > r) return n = "receive_ack receive Timeout", e(n), Promise.reject(new NFCPortError(NFCPortError.ACK_TIMEOUT, n, this._fileName, 794));
            if (a = await this.communicator.receive(NFCPort100.ACK_CMD.length - i.length, r - s), e("Receive : " + array_tohexs(a)), array_append(i, a), i.length >= NFCPort100.ACK_CMD.length) {
                if (0 == array_compare(i, 0, NFCPort100.ACK_CMD, 0, NFCPort100.ACK_CMD.length)) break;
                i = array_slice(i, 1)
            }
        }
        return e("receive_ack end"), i
    }
    async send_packet_ext(r) {
        let t, i;
        return e("send_packet_ext begin"), await this.communicator.clear(), t = new Uint8Array(8 + r.length + 2), t[0] = 0, t[1] = 0, t[2] = 255, t[3] = 255, t[4] = 255, array_set_uint16l(t, 5, r.length), t[7] = this.get_packet_length_checksum(r.length), array_copy(t, 8, r, 0, r.length), t[8 + r.length] = this.get_packet_data_checksum(r), t[8 + r.length + 1] = 0, i = await this.communicator.transmit(t), e("send_packet_ext end"), i
    }
    get_packet_length_checksum(e) {
        return 255 & -((e >> 8 & 255) + (255 & e))
    }
    get_packet_data_checksum(e) {
        let r, t = 0;
        for (t = 0, r = 0; r < e.length; r++) t += e[r];
        return 255 & -t
    }
    async receive_packet(r, t) {
        let i, a, o, s, n, _;
        return e("receive_packet begin (timeout=" + t + ")"), i = new Date, e("start time=" + i.getTime()), a = 0, o = await this.communicator.receive(5, t).then(r => (e("Frame : " + array_tohexs(r)), 0 == r[0] && 0 == r[1] && 255 == r[2] && 255 == r[3] && 255 == r[4] ? (s = new Date, n = s.getTime() - i.getTime(), n > t ? (_ = "receive_packet reslen checksum receive timeout", e(_), Promise.reject(new NFCPortError(NFCPortError.DATA_RECEIVE_TIMEOUT, _, this._fileName, 884))) : this.communicator.receive(3, t - n).then(r => (a = array_get_uint16l(r, 0), this.get_packet_length_checksum(a) != r[2] ? (_ = "receive_packet response reslen checksum error", e(_), Promise.reject(new NFCPortError(NFCPortError.INVALID_RESPONSE, _, this._fileName, 895))) : (s = new Date, n = s.getTime() - i.getTime(), n > t ? (_ = "receive_packet response-data receive timeout", e(_), Promise.reject(new NFCPortError(NFCPortError.DATA_RECEIVE_TIMEOUT, _, this._fileName, 905))) : this.communicator.receive(a, t - n))))) : (a = r[3], this.get_packet_length_checksum(a) != r[4] ? (_ = "receive_packet Error-response reslen checksum error", e(_), Promise.reject(new NFCPortError(NFCPortError.INVALID_RESPONSE, _, this._fileName, 915))) : (s = new Date, n = s.getTime() - i.getTime(), n > t ? (_ = "receive_packet response-data receive timeout", e(_), Promise.reject(new NFCPortError(NFCPortError.DATA_RECEIVE_TIMEOUT, _, this._fileName, 923))) : this.communicator.receive(a, t - n))))).then(t => (e("Receive : " + array_tohexs(t)), r != t[0] ? (_ = "receive_packet invalid res-code", e(_), Promise.reject(new NFCPortError(NFCPortError.INVALID_RESPONSE, _, this._fileName, 936))) : t)).then(r => (s = new Date, n = s.getTime() - i.getTime(), n > t ? (_ = "receive_packet dcs receive timeout", e(_), Promise.reject(new NFCPortError(NFCPortError.DATA_RECEIVE_TIMEOUT, _, this._fileName, 947))) : this.communicator.receive(2, t - n).then(t => this.get_packet_data_checksum(r) != t[0] || 0 != t[1] ? (_ = "receive_packet dcs checksum error", e(_), Promise.reject(new NFCPortError(NFCPortError.INVALID_RESPONSE, _, this._fileName, 957))) : r))), e("receive_packet end"), o
    }
    async receive_ack_and_response(r, t) {
        let i, a, o, s, n, _, c, E, N;
        for (e("receive_ack_and_response begin"), null == t && (t = null != this.config && null != this.config.receiveTimeout ? this.config.receiveTimeout : ReaderWriterBase.DEFAULT_RECEIVE_TIMEOUT), i = new Date, a = [];;) {
            for (e("search ACK");;) {
                if (o = new Date, s = o.getTime() - i.getTime(), s > t) return n = "transceive ACK receive Timeout", e(n), Promise.reject(new NFCPortError(NFCPortError.ACK_TIMEOUT, n, this._fileName, 1001));
                if (a.length < NFCPort100.ACK_CMD.length && (_ = await this.communicator.receive(NFCPort100.ACK_CMD.length - a.length, t - s), e("Receive : " + array_tohexs(_)), array_append(a, _)), a.length >= NFCPort100.ACK_CMD.length) {
                    if (0 == array_compare(a, 0, NFCPort100.ACK_CMD, 0, NFCPort100.ACK_CMD.length)) {
                        a = array_slice(a, NFCPort100.ACK_CMD.length);
                        break
                    }
                    a = array_slice(a, 1)
                }
            }
            if (a.length < 5) {
                if (o = new Date, s = o.getTime() - i.getTime(), s > t) return n = "transceive Response receive Timeout", e(n), Promise.reject(new NFCPortError(NFCPortError.ACK_TIMEOUT, n, this._fileName, 1033));
                c = 0, _ = await this.communicator.receive(5 - a.length, t - s), array_append(a, _)
            }
            if (e("Preamble & SPC & Ext Frame Code : " + array_tohexs(a, 0, 5)), 0 == a[0] && 0 == a[1] && 255 == a[2] && 255 == a[3] && 255 == a[4]) {
                if (a = array_slice(a, 5), a.length < 3) {
                    if (o = new Date, e("current time=" + o.getTime()), s = o.getTime() - i.getTime(), e("elapsed = " + s), s > t) return n = "receive_packet reslen checksum receive timeout", e(n), Promise.reject(new NFCPortError(NFCPortError.DATA_RECEIVE_TIMEOUT, n, this._fileName, 1057));
                    _ = await this.communicator.receive(3 - a.length, t - s), array_append(a, _)
                }
                if (e("Length & LCS : " + array_tohexs(a, 0, 3)), c = array_get_uint16l(a, 0), c >= 2 && this.get_packet_length_checksum(c) == a[2]) {
                    if (E = array_slice(a, 3), E.length < 2) {
                        if (o = new Date, s = o.getTime() - i.getTime(), s > t) return n = "receive_packet response-data receive timeout", e(n), Promise.reject(new NFCPortError(NFCPortError.DATA_RECEIVE_TIMEOUT, n, this._fileName, 1079));
                        _ = await this.communicator.receive(2 - E.length, t - s), array_append(a, _), array_append(E, _)
                    }
                    if (e("Res Comand + SubRes Command : " + array_tohexs(E, 0, 2)), NFCPort100.NFC100_RESPONSE_CODE == E[0] && r == E[1]) {
                        if (a = E, a.length < c) {
                            if (o = new Date, s = o.getTime() - i.getTime(), s > t) return n = "receive_packet response-data receive timeout", e(n), Promise.reject(new NFCPortError(NFCPortError.DATA_RECEIVE_TIMEOUT, n, this._fileName, 1099));
                            _ = await this.communicator.receive(c - a.length, t - s), array_append(a, _)
                        }
                        if (e("Res data(remain) : " + array_tohexs(a, 2, c - 2)), N = array_slice(a, 0, c), a = array_slice(a, c), a.length < 2) {
                            if (o = new Date, s = o.getTime() - i.getTime(), s > t) return n = "receive_packet dcs receive timeout", e(n), Promise.reject(new NFCPortError(NFCPortError.DATA_RECEIVE_TIMEOUT, n, this._fileName, 1121));
                            _ = await this.communicator.receive(2 - a.length, t - s), array_append(a, _)
                        }
                        if (e("DCS & Postamble : " + array_tohexs(a)), this.get_packet_data_checksum(N) != a[0] || 0 != a[1]) return n = "receive_packet dcs checksum error", e(n), Promise.reject(new NFCPortError(NFCPortError.INVALID_RESPONSE, n, this._fileName, 1136));
                        break
                    }
                }
            }
        }
        return e("receive_ack_and_response end"), E
    }
    async error_recovery(r) {
        e("error_recovery begin");
        try {
            await this.send_ack(), r && await this.communicator.receive(0, ReaderWriterBase.BUFFER_CLEAR_TIMEOUT)
        } catch (e) {}
        e("error_recovery end")
    }
    async transceive_ext(r) {
        let t, i;
        e("transceive_ext begin");
        try {
            await this.send_packet_ext(r)
        } catch (r) {
            return e("transceive_ext send error catch"), await this.error_recovery(!1), Promise.reject(r)
        }
        t = null != this.config && null != this.config.ackTimeout ? this.config.ackTimeout : ReaderWriterBase.DEFAULT_ACK_TIMEOUT;
        try {
            i = await this.receive_ack(t).then(e => (t = null != this.config && null != this.config.receiveTimeout ? this.config.receiveTimeout : ReaderWriterBase.DEFAULT_RECEIVE_TIMEOUT, this.receive_packet(NFCPort100.NFC100_RESPONSE_CODE, t)))
        } catch (r) {
            return e("transceive_ext receive error catch"), await this.error_recovery(!0), Promise.reject(r)
        }
        return e("transceive_ext end"), i
    }
    async get_lt_info() {
        let r, t, i, a, o, s, n, _;
        for (e("get_lt_info begin"), r = await this.GetProperty(), t = [r[14], r[15]], i = !1, a = 0; a < NFCPort100.LT_INFO_TABLE.length; a++)
            if (o = NFCPort100.LT_INFO_TABLE[a], o[0] == t[0] && o[1] == t[1]) {
                i = !0;
                break
            } if (!i) return s = "LT-Info unsuported Reader/Writer.", e(s), null;
        for (n = await this.GetPDDataVersion(), _ = null, a = 0; a < NFCPort100.LT_INFO_TABLE.length; a++)
            if (o = NFCPort100.LT_INFO_TABLE[a], o[0] == t[0] && o[1] == t[1] && o[2] == n[0] && o[3] == n[1]) {
                _ = array_slice(o, 4);
                break
            } return null == _ ? (s = "LT-Info unsuported Reader/Writer.", e(s), null) : (e("get_lt_info end"), _)
    }
    async update_rct_setting(r, t) {
        let i, a, o, s;
        for (e("update_rct_setting begin"), i = r.length / 3, a = 0; a < i; a++)
            if (o = 3 * a, r[o] == t[0] && r[o + 1] == t[1]) return r[o + 2] == t[2] ? null : (r[o + 2] = t[2], r);
        return i >= NFCPort100.NFC100_IN_SET_RCT_SETTING_NUM_MAX ? null : (s = array_append(r, t), e("update_rct_setting end"), s)
    }
    async SetCommandType(r) {
        let t, i, a;
        if (e("SetCommandType begin"), null == r) return t = "Invalid parameter (type)", e(t), Promise.reject(new NFCPortError(NFCPortError.INVALID_PARAMETER, t, this._fileName, 1310));
        i = new Uint8Array(3), i[0] = NFCPort100.NFC100_COMMAND_CODE, i[1] = NFCPort100.SCC_SET_COMMAND_TYPE, i[2] = r, a = await this.transceive_ext(i).then(r => 3 != r.length ? (t = "Illegal response length", e(t), Promise.reject(new NFCPortError(NFCPortError.INVALID_RESPONSE, t, this._fileName, 1325))) : r[0] != NFCPort100.NFC100_RESPONSE_CODE ? (t = "Illegal response code", e(t), Promise.reject(new NFCPortError(NFCPortError.INVALID_RESPONSE, t, this._fileName, 1329))) : r[1] != NFCPort100.SRC_SET_COMMAND_TYPE ? (t = "Illegal sub-response code", e(t), Promise.reject(new NFCPortError(NFCPortError.INVALID_RESPONSE, t, this._fileName, 1333))) : r[2] != NFCPort100.STATUS_SUCCESS ? (t = "Invalid Status", e(t), Promise.reject(new NFCPortError(NFCPortError.INVALID_STATUS, t, this._fileName, 1337))) : void 0), e("SetCommandType end")
    }
    async InSetRF(r, t, i, a) {
        let o, s, n;
        if (e("InSetRF begin"), null == r || null == t || null == i || null == a) return o = "Invalid parameter", e(o), Promise.reject(new NFCPortError(NFCPortError.INVALID_PARAMETER, o, this._fileName, 1357));
        s = new Uint8Array(6), s[0] = NFCPort100.NFC100_COMMAND_CODE, s[1] = NFCPort100.SCC_IN_SET_RF, s[2] = r, s[3] = t, s[4] = i, s[5] = a, n = await this.transceive_ext(s).then(r => 3 != r.length ? (o = "Illegal response length", e(o), Promise.reject(new NFCPortError(NFCPortError.INVALID_RESPONSE, o, this._fileName, 1375))) : r[0] != NFCPort100.NFC100_RESPONSE_CODE ? (o = "Illegal response code", e(o), Promise.reject(new NFCPortError(NFCPortError.INVALID_RESPONSE, o, this._fileName, 1379))) : r[1] != NFCPort100.SRC_IN_SET_RF ? (o = "Illegal sub-response code", e(o), Promise.reject(new NFCPortError(NFCPortError.INVALID_RESPONSE, o, this._fileName, 1383))) : r[2] != NFCPort100.STATUS_SUCCESS ? (o = "Invalid Status", e(o), Promise.reject(new NFCPortError(NFCPortError.INVALID_STATUS, o, this._fileName, 1387))) : void 0), e("InSetRF end")
    }
    async InSetProtocol(r) {
        let t, i, a;
        if (e("InSetProtocol begin"), null == r || 0 == r.length) return t = "Invalid parameter (protocol_array)", e(t), Promise.reject(new NFCPortError(NFCPortError.INVALID_PARAMETER, t, this._fileName, 1407));
        (r = this.getUpdateProtocol(r)).length > 0 && (i = new Uint8Array(2 + r.length), i[0] = NFCPort100.NFC100_COMMAND_CODE, i[1] = NFCPort100.SCC_IN_SET_PROTOCOL, array_copy(i, 2, r, 0, r.length), a = await this.transceive_ext(i).then(r => 3 != r.length ? (t = "Illegal response length", e(t), Promise.reject(new NFCPortError(NFCPortError.INVALID_RESPONSE, t, this._fileName, 1424))) : r[0] != NFCPort100.NFC100_RESPONSE_CODE ? (t = "Illegal response code", e(t), Promise.reject(new NFCPortError(NFCPortError.INVALID_RESPONSE, t, this._fileName, 1428))) : r[1] != NFCPort100.SRC_IN_SET_PROTOCOL ? (t = "Illegal sub-response code", e(t), Promise.reject(new NFCPortError(NFCPortError.INVALID_RESPONSE, t, this._fileName, 1432))) : r[2] != NFCPort100.STATUS_SUCCESS ? (t = "Invalid Status", e(t), Promise.reject(new NFCPortError(NFCPortError.INVALID_STATUS, t, this._fileName, 1436))) : void 0), this.setCurrentProtocol(r)), e("InSetProtocol end")
    }
    async SwitchRF(r) {
        let t, i, a;
        if (e("SwitchRF begin"), null == r) return t = "Invalid parameter (type)", e(t), Promise.reject(new NFCPortError(NFCPortError.INVALID_PARAMETER, t, this._fileName, 1460));
        i = new Uint8Array(3), i[0] = NFCPort100.NFC100_COMMAND_CODE, i[1] = NFCPort100.SCC_SWITCH_RF, i[2] = r, a = await this.transceive_ext(i).then(r => 3 != r.length ? (t = "Illegal response length", e(t), Promise.reject(new NFCPortError(NFCPortError.INVALID_RESPONSE, t, this._fileName, 1475))) : r[0] != NFCPort100.NFC100_RESPONSE_CODE ? (t = "Illegal response code", e(t), Promise.reject(new NFCPortError(NFCPortError.INVALID_RESPONSE, t, this._fileName, 1479))) : r[1] != NFCPort100.SRC_SWITCH_RF ? (t = "Illegal sub-response code", e(t), Promise.reject(new NFCPortError(NFCPortError.INVALID_RESPONSE, t, this._fileName, 1483))) : r[2] == NFCPort100.STATUS_TEMPERATURE_ERROR || r[2] == NFCPort100.STATUS_INTTEMPRFOFF_ERROR ? (this.bAbnormalState = !0, t = "Temperature error", e(t), Promise.reject(new NFCPortError(NFCPortError.DEVICE_FATAL_ERROR, t, this._fileName, 1489))) : r[2] != NFCPort100.STATUS_SUCCESS ? (t = "Invalid Status", e(t), Promise.reject(new NFCPortError(NFCPortError.INVALID_STATUS, t, this._fileName, 1493))) : void 0), e("SwitchRF end")
    }
    async GetFirmwareVersion(r) {
        let t, i, a;
        e("GetFirmwareVersion begin");
        let o = 2;
        return null != r && (o = 3), t = new Uint8Array(o), t[0] = NFCPort100.NFC100_COMMAND_CODE, t[1] = NFCPort100.SCC_GET_FIRMWARE_VERSION, null != r && (t[2] = r), i = await this.transceive_ext(t).then(r => 4 != r.length ? (a = "Illegal response length", e(a), Promise.reject(new NFCPortError(NFCPortError.INVALID_RESPONSE, a, this._fileName, 1530))) : r[0] != NFCPort100.NFC100_RESPONSE_CODE ? (a = "Illegal response code", e(a), Promise.reject(new NFCPortError(NFCPortError.INVALID_RESPONSE, a, this._fileName, 1534))) : r[1] != NFCPort100.SRC_GET_FIRMWARE_VERSION ? (a = "Illegal sub-response code", e(a), Promise.reject(new NFCPortError(NFCPortError.INVALID_RESPONSE, a, this._fileName, 1538))) : [r[3], r[2]]), e("GetFirmwareVersion end"), i
    }
    async GetPDDataVersion() {
        let r, t, i;
        return e("GetPDDataVersion begin"), r = new Uint8Array(2), r[0] = NFCPort100.NFC100_COMMAND_CODE, r[1] = NFCPort100.SCC_GET_PDDATA_VERSION, t = await this.transceive_ext(r).then(r => 4 != r.length ? (i = "Illegal response length", e(i), Promise.reject(new NFCPortError(NFCPortError.INVALID_RESPONSE, i, this._fileName, 1566))) : r[0] != NFCPort100.NFC100_RESPONSE_CODE ? (i = "Illegal response code", e(i), Promise.reject(new NFCPortError(NFCPortError.INVALID_RESPONSE, i, this._fileName, 1570))) : r[1] != NFCPort100.SRC_GET_PDDATA_VERSION ? (i = "Illegal sub-response code", e(i), Promise.reject(new NFCPortError(NFCPortError.INVALID_RESPONSE, i, this._fileName, 1574))) : [r[3], r[2]]), e("GetPDDataVersion end"), t
    }
    async GetProperty() {
        let r, t, i;
        return e("GetProperty begin"), r = new Uint8Array(2), r[0] = NFCPort100.NFC100_COMMAND_CODE, r[1] = NFCPort100.SCC_GET_PROPERTY, t = await this.transceive_ext(r).then(r => r.length < 3 ? (i = "Illegal response length", e(i), Promise.reject(new NFCPortError(NFCPortError.INVALID_RESPONSE, i, this._fileName, 1602))) : r[0] != NFCPort100.NFC100_RESPONSE_CODE ? (i = "Illegal response code", e(i), Promise.reject(new NFCPortError(NFCPortError.INVALID_RESPONSE, i, this._fileName, 1606))) : r[1] != NFCPort100.SRC_GET_PROPERTY ? (i = "Illegal sub-response code", e(i), Promise.reject(new NFCPortError(NFCPortError.INVALID_RESPONSE, i, this._fileName, 1610))) : array_slice(r, 2)), e("GetProperty end"), t
    }
    async InSetRCT(r, t, i) {
        let a, o;
        e("InSetRCT begin"), a = new Uint8Array(18 + (t.length + 1) + (i.length + 1)), a[0] = NFCPort100.NFC100_COMMAND_CODE, a[1] = NFCPort100.SCC_IN_SET_RCT, array_copy(a, 2, r), a[18] = t.length / 3, array_copy(a, 19, t), a[19 + t.length] = i.length / 3, array_copy(a, 19 + t.length + 1, i), await this.transceive_ext(a).then(r => 3 != r.length ? (o = "Illegal response length", e(o), Promise.reject(new NFCPortError(NFCPortError.INVALID_RESPONSE, o, this._fileName, 1642))) : r[0] != NFCPort100.NFC100_RESPONSE_CODE ? (o = "Illegal response code", e(o), Promise.reject(new NFCPortError(NFCPortError.INVALID_RESPONSE, o, this._fileName, 1646))) : r[1] != NFCPort100.SRC_IN_SET_RCT ? (o = "Illegal sub-response code", e(o), Promise.reject(new NFCPortError(NFCPortError.INVALID_RESPONSE, o, this._fileName, 1650))) : r[2] == NFCPort100.STATUS_PARAMETER_ERROR ? (o = "PARAMETER_ERROR", e(o), Promise.reject(new NFCPortError(NFCPortError.UNKNOWN_ERROR, o, this._fileName, 1654))) : r[2] == NFCPort100.STATUS_PWD_ERROR ? (o = "PWD_ERROR", e(o), Promise.reject(new NFCPortError(NFCPortError.UNKNOWN_ERROR, o, this._fileName, 1658))) : r[2] != NFCPort100.STATUS_SUCCESS ? (o = "Invalid status", e(o), Promise.reject(new NFCPortError(NFCPortError.INVALID_STATUS, o, this._fileName, 1662))) : void 0), e("InSetRCT end")
    }
    async InGetRCT(r) {
        let t, i, a, o, s, n, _, c;
        return e("InGetRCT begin"), t = new Uint8Array(18), t[0] = NFCPort100.NFC100_COMMAND_CODE, t[1] = NFCPort100.SCC_IN_GET_RCT, array_copy(t, 2, r), i = await this.transceive_ext(t).then(r => r.length < 11 ? (a = "Illegal response length", e(a), Promise.reject(new NFCPortError(NFCPortError.INVALID_RESPONSE, a, this._fileName, 1696))) : r[0] != NFCPort100.NFC100_RESPONSE_CODE ? (a = "Illegal response code", e(a), Promise.reject(new NFCPortError(NFCPortError.INVALID_RESPONSE, a, this._fileName, 1700))) : r[1] != NFCPort100.SRC_IN_GET_RCT ? (a = "Illegal sub-response code", e(a), Promise.reject(new NFCPortError(NFCPortError.INVALID_RESPONSE, a, this._fileName, 1704))) : r[2] == NFCPort100.STATUS_PWD_ERROR ? (a = "PWD_ERROR", e(a), Promise.reject(new NFCPortError(NFCPortError.UNKNOWN_ERROR, a, this._fileName, 1708))) : r[2] != NFCPort100.STATUS_SUCCESS ? (a = "Invalid status", e(a), Promise.reject(new NFCPortError(NFCPortError.INVALID_STATUS, a, this._fileName, 1712))) : array_slice(r, 3)), s = 3 * i[0], n = array_slice(i, 1, s), _ = 3 * i[1 + s], c = array_slice(i, 1 + s + 1, _), o = {}, o.in_send_setting = n, o.in_receive_setting = c, e("InGetRCT end"), o
    }
    async ReadRegister(r, t) {
        let i, a, o;
        return e("ReadRegister begin"), null == r || null == t ? (i = "Invalid parameter", e(i), Promise.reject(new NFCPortError(NFCPortError.INVALID_PARAMETER, i, this._fileName, 1743))) : (a = new Uint8Array(19), a[0] = NFCPort100.NFC100_COMMAND_CODE, a[1] = NFCPort100.SCC_READ_REGISTER, array_copy(a, 2, r, 0, r.length), a[18] = t, o = await this.transceive_ext(a).then(r => 5 != r.length ? (i = "Illegal response length", e(i), Promise.reject(new NFCPortError(NFCPortError.INVALID_RESPONSE, i, this._fileName, 1759))) : r[0] != NFCPort100.NFC100_RESPONSE_CODE ? (i = "Illegal response code", e(i), Promise.reject(new NFCPortError(NFCPortError.INVALID_RESPONSE, i, this._fileName, 1763))) : r[1] != NFCPort100.SRC_READ_REGISTER ? (i = "Illegal sub-response code", e(i), Promise.reject(new NFCPortError(NFCPortError.INVALID_RESPONSE, i, this._fileName, 1767))) : r[2] != NFCPort100.STATUS_SUCCESS ? (i = "Invalid Status", e(i), Promise.reject(new NFCPortError(NFCPortError.INVALID_STATUS, i, this._fileName, 1771))) : r[3] != t ? (i = "Invalid read address", e(i), Promise.reject(new NFCPortError(NFCPortError.INVALID_RESPONSE, i, this._fileName, 1775))) : r[4]), e("ReadRegister end"), o)
    }
    async InCommRF(r, t) {
        let i, a, o, s, n, _, c;
        return e("InCommRF begin"), null == r || null == t ? (i = "Invalid parameter", e(i), Promise.reject(new NFCPortError(NFCPortError.INVALID_PARAMETER, i, this._fileName, 1801))) : (e("SendData : " + array_tohexs(r)), a = new Uint8Array(4 + r.length), a[0] = NFCPort100.NFC100_COMMAND_CODE, a[1] = NFCPort100.SCC_IN_COMM_RF, array_set_uint16l(a, 2, 10 * t), array_copy(a, 4, r, 0, r.length), o = await this.transceive_ext(a).then(r => {
            if (r.length < 6) return i = "Illegal response length", e(i), Promise.reject(new NFCPortError(NFCPortError.INVALID_RESPONSE, i, this._fileName, 1818));
            if (r[0] != NFCPort100.NFC100_RESPONSE_CODE) return i = "Illegal response code", e(i), Promise.reject(new NFCPortError(NFCPortError.INVALID_RESPONSE, i, this._fileName, 1822));
            if (r[1] != NFCPort100.SRC_IN_COMM_RF) return i = "Illegal sub-response code", e(i), Promise.reject(new NFCPortError(NFCPortError.INVALID_RESPONSE, i, this._fileName, 1826));
            if (0 != array_get_uint32l(r, 2)) return s = array_get_uint32l(r, 2), s == NFCPort100.COM_STATUS_TEMPERATURE_ERROR || s == NFCPort100.COM_STATUS_INTTEMPRFOFF_ERROR ? (n = NFCPortError.DEVICE_FATAL_ERROR, i = "Invalid Status(Temperature error)", this.bAbnormalState = !0) : s == NFCPort100.COM_STATUS_REC_TIMEOUT_ERROR ? (n = NFCPortError.THRU_RESPONSE_PACKET_NOT_RECEIVED, i = "Invalid Status(Card response timeout)") : (n = NFCPortError.INVALID_STATUS, i = "Invalid Status"), e(i), _ = new NFCPortError(n, i, this._fileName, 1842), _.communicationStatus = s, Promise.reject(_);
            if (6 == r.length) return i = "Illegal response length", e(i), Promise.reject(new NFCPortError(NFCPortError.INVALID_RESPONSE, i, this._fileName, 1848));
            if (8 != r[6] && (this.protocol == ReaderWriterBase.PROTOCOL_ISO14443_3A || this.protocol == ReaderWriterBase.PROTOCOL_ISO14443_4A)) {
                const t = r[6];
                if (!(1 <= t && t <= 7 && r.length > 7)) return i = "Illegal RxLastBit", e(i), Promise.reject(new NFCPortError(NFCPortError.INVALID_RESPONSE, i, this._fileName, 1857));
                {
                    const e = (1 << t) - 1;
                    r[r.length - 1] &= e
                }
            }
            return c = new Array(r.length - 7), r.length - 7 > 0 && array_copy(c, 0, r, 7, r.length - 7), e("Response :" + array_tohexs(c)), c
        }), e("InCommRF end"), o)
    }
    async Diagnose(r, t) {
        let i, a;
        e("Diagnose begin");
        switch (r) {
            case ReaderWriterBase.DIAGNOSE_COMMUNICATION_LINE_TEST:
                a = new Uint8Array(3 + t.length), a[2] = ReaderWriterBase.DIAGNOSE_TESTNO_COMMUNICATION_LINE, array_copy(a, 3, t, 0, t.length);
                break;
            case ReaderWriterBase.DIAGNOSE_ROM_TEST:
                a = new Uint8Array(3), a[2] = ReaderWriterBase.DIAGNOSE_TESTNO_ROM;
                break;
            case ReaderWriterBase.DIAGNOSE_RAM_TEST:
                a = new Uint8Array(3), a[2] = ReaderWriterBase.DIAGNOSE_TESTNO_RAM;
                break;
            case ReaderWriterBase.DIAGNOSE_POLLING_TEST:
            default:
                return i = "Invalid parameter", e(i), Promise.reject(new NFCPortError(NFCPortError.INVALID_PARAMETER, i, this._fileName, 1901))
        }
        a[0] = NFCPort100.NFC100_COMMAND_CODE, a[1] = NFCPort100.SCC_DIAGNOSE;
        let o = await this.transceive_ext(a).then(t => {
            if (t.length < 3) return i = "Illegal response length", e(i), Promise.reject(new NFCPortError(NFCPortError.INVALID_RESPONSE, i, this._fileName, 1912));
            if (t[0] != NFCPort100.NFC100_RESPONSE_CODE) return i = "Illegal response code", e(i), Promise.reject(new NFCPortError(NFCPortError.INVALID_RESPONSE, i, this._fileName, 1916));
            if (t[1] != NFCPort100.SRC_DIAGNOSE) return i = "Illegal sub-response code", e(i), Promise.reject(new NFCPortError(NFCPortError.INVALID_RESPONSE, i, this._fileName, 1920));
            const a = t.slice(3);
            switch (r) {
                case ReaderWriterBase.DIAGNOSE_COMMUNICATION_LINE_TEST:
                    return new Uint8Array(a);
                case ReaderWriterBase.DIAGNOSE_ROM_TEST:
                    return Number(a);
                case ReaderWriterBase.DIAGNOSE_RAM_TEST:
                    return new Uint8Array(a);
                case ReaderWriterBase.DIAGNOSE_POLLING_TEST:
                default:
                    return i = "Invalid parameter", e(i), Promise.reject(new NFCPortError(NFCPortError.INVALID_PARAMETER, i, this._fileName, 1937))
            }
        });
        return e("Diagnose end"), o
    }
    async DiagnosePollingTest(r, t) {
        let i;
        e("DiagnosePollingTest begin");
        const a = new DetectionOption;
        let o = 0;
        for (let s = 0; s < t; s++) try {
            if (r == ReaderWriterBase.PROTOCOL_ISO18092 || r == ReaderWriterBase.PROTOCOL_FELICA) await this.detectCard_FeliCa(a);
            else if (r == ReaderWriterBase.PROTOCOL_ISO14443_3A || r == ReaderWriterBase.PROTOCOL_ISO14443_4A) await this.detectCard_TypeA(a);
            else {
                if (r != ReaderWriterBase.PROTOCOL_ISO14443_4B) return r == ReaderWriterBase.PROTOCOL_ISO15693 ? (i = "Invalid parameter (protocol)", e(i), Promise.reject(new NFCPortError(NFCPortError.INVALID_PARAMETER, i, this._fileName, 1964))) : (i = "Invalid parameter (protocol)", e(i), Promise.reject(new NFCPortError(NFCPortError.INVALID_PARAMETER, i, this._fileName, 1968)));
                await this.detectCard_TypeB(a)
            }
            o++
        } catch (r) {
            e("DiagnosePollingTest: Polling Failed")
        }
        return e("DiagnosePollingTest end"), Number(o)
    }
    async typea_reqa_wupa() {
        e("typea_reqa_wupa begin");
        const r = [NFCPort100.NFC100_TYPEA_CMD_REQA];
        let i, a, o;
        await this.InSetProtocol([1, 0, 2, 0, 4, 0, 5, 1, 6, 0, 7, 7, 8, 0]), i = t;
        try {
            a = await this.InCommRF(r, i)
        } catch (e) {
            return e.errorType == NFCPortError.THRU_RESPONSE_PACKET_NOT_RECEIVED && (e.errorType = NFCPortError.CARD_NOT_DETECTED, e.message = "Card not detected"), Promise.reject(e)
        }
        return 2 != a.length ? (o = "Invalid ATQA length", e(o), Promise.reject(new NFCPortError(NFCPortError.CARD_NOT_DETECTED, o, this._fileName, 2016))) : (e("typea_reqa_wupa ATQA=" + array_tohexs(a)), e("typea_reqa_wupa end"), a)
    }
    async typea_anticollision() {
        e("typea_anticollision begin");
        const r = [1, 1, 2, 1, 6, 0],
            i = [1, 0, 2, 0, 6, 1];
        let a, o, s, n, _, c, E, N, l;
        for (await this.InSetProtocol([4, 1, 6, 1, 7, 8]), a = t, o = [], s = 1; s <= 3; s++) {
            n = NFCPort100.NFC100_TYPEA_CMD_SEL_CL_1, 2 == s ? n = NFCPort100.NFC100_TYPEA_CMD_SEL_CL_2 : 3 == s && (n = NFCPort100.NFC100_TYPEA_CMD_SEL_CL_3), _ = [n, 32];
            try {
                c = await this.InCommRF(_, a)
            } catch (e) {
                return e.errorType == NFCPortError.THRU_RESPONSE_PACKET_NOT_RECEIVED && (e.errorType = NFCPortError.CARD_NOT_DETECTED, e.message = "Card not detected"), Promise.reject(e)
            }
            if (5 != c.length) return E = "Invalid uid-cln length", e(E), Promise.reject(new NFCPortError(NFCPortError.CARD_NOT_DETECTED, E, this._fileName, 2086));
            await this.InSetProtocol(r), N = [n, 112, 0, 0, 0, 0, 0], array_copy(N, 2, c, 0, c.length);
            try {
                l = await this.InCommRF(N, a)
            } catch (e) {
                return e.errorType == NFCPortError.THRU_RESPONSE_PACKET_NOT_RECEIVED && (e.errorType = NFCPortError.CARD_NOT_DETECTED, e.message = "Card not detected"), Promise.reject(e)
            }
            if (1 != l.length) return E = "Invalid SAK length", e(E), Promise.reject(new NFCPortError(NFCPortError.CARD_NOT_DETECTED, E, this._fileName, 2109));
            if (0 == (4 & l[0])) {
                array_append(o, c, 0, 4);
                break
            }
            array_append(o, c, 1, 3), await this.InSetProtocol(i)
        }
        return e("typea_anticollision SAK=" + array_tohexs(l)), e("typea_anticollision UID=" + array_tohexs(o)), e("typea_anticollision end"), new Uint8Array(o)
    }
    async typea_iso14443_4_activate(r, t, a) {
        let o, s, n, _, c, E, N, l, P, C, R, u, T, F, I, A, h;
        e("typea_iso14443_4_activate begin"), o = [224, 0], o[1] = r << 4 & 240 | 15 & t, s = ISO14443_4_CC_UNIT_MS(71680), s += 20;
        try {
            n = await this.InCommRF(o, s)
        } catch (e) {
            return e.errorType == NFCPortError.THRU_RESPONSE_PACKET_NOT_RECEIVED && (e.errorType = NFCPortError.CARD_NOT_DETECTED, e.message = "Card not detected"), Promise.reject(e)
        }
        if (e("typea_iso14443_4_activate ATS=" + array_tohexs(n)), n.length < 0) return _ = "Invalid ATS length", e(_), Promise.reject(new NFCPortError(NFCPortError.CARD_NOT_DETECTED, _, this._fileName, 2171));
        if (n.length < 5 || n[0] < 5) return _ = "Invalid ATS length", e(_), Promise.reject(new NFCPortError(NFCPortError.CARD_NOT_DETECTED, _, this._fileName, 2178));
        if (c = 15 & n[1], E = n[2] >> 4 & 3, N = 3 & n[2], await wait_async(NFCPort100.ISO14443_4_CC_DEFAULT_SFGI), T = ReaderWriterBase.BAUDRATE_106K, a && (0 != E || 0 != N) && (0 != (2 & E) && 0 != (2 & N) ? (l = 2, P = 2) : 0 != (1 & E) && 0 != (1 & N) ? (l = 1, P = 1) : (l = 0, P = 0), 0 != l || 0 != P)) {
            C = [208, 17, 0], C[0] = 208 + (15 & t), C[2] = l << 2 & 12 | 3 & P, R = 4, s = ISO14443_4_CC_FWT(4), s += i, s += 20;
            try {
                u = await this.InCommRF(C, s)
            } catch (e) {
                return e.errorType == NFCPortError.THRU_RESPONSE_PACKET_NOT_RECEIVED && (e.errorType = NFCPortError.CARD_NOT_DETECTED, e.message = "Card not detected"), Promise.reject(e)
            }
            if (e("typea_iso14443_4_activate PPSRES=" + array_tohexs(u)), 1 != u.length) return _ = "Invalid PPS-Response length", e(_), Promise.reject(new NFCPortError(NFCPortError.CARD_NOT_DETECTED, _, this._fileName, 2222));
            if (208 != (240 & u[0])) return _ = "PPS-Response status error", e(_), Promise.reject(new NFCPortError(NFCPortError.CARD_NOT_DETECTED, _, this._fileName, 2226));
            2 == l ? (F = NFCPort100.NFC100_RBT_INITIATOR_ISO14443A_424K, I = NFCPort100.NFC100_RF_INITIATOR_ISO14443A_424K, T = ReaderWriterBase.BAUDRATE_424K) : 1 == l ? (F = NFCPort100.NFC100_RBT_INITIATOR_ISO14443A_212K, I = NFCPort100.NFC100_RF_INITIATOR_ISO14443A_212K, T = ReaderWriterBase.BAUDRATE_212K) : (F = NFCPort100.NFC100_RBT_INITIATOR_ISO14443A_106K, I = NFCPort100.NFC100_RF_INITIATOR_ISO14443A_106K), 2 == P ? (A = NFCPort100.NFC100_RBT_INITIATOR_ISO14443A_424K, h = NFCPort100.NFC100_RF_INITIATOR_ISO14443A_424K) : 1 == P ? (A = NFCPort100.NFC100_RBT_INITIATOR_ISO14443A_212K, h = NFCPort100.NFC100_RF_INITIATOR_ISO14443A_212K) : (A = NFCPort100.NFC100_RBT_INITIATOR_ISO14443A_106K, h = NFCPort100.NFC100_RF_INITIATOR_ISO14443A_106K), await this.InSetRF(F, I, A, h)
        }
        this.targetCardBaudRate = T, e("typea_iso14443_4_activate end")
    }
    async typea_mifareAuth(r) {
        e("typea_mifareAuth begin");
        let t, i, a, o;
        await this.InSetProtocol([8, 1]), i = [96, r.blockNumber, 0, 0, 0, 0, 0, 0], "KeyA" == r.keyType ? i[0] = 96 : i[0] = 97, array_copy(i, 2, r.key, 0, 6), array_append(i, r.uid), a = ReaderWriterBase.COMMUNICATE_THRU_DEFAULT_TIMEOUT;
        try {
            if (o = await this.InCommRF(i, a), 0 != o.length) return t = "Invalid Mifare authentication response length", e(t), Promise.reject(new NFCPortError(NFCPortError.AUTHENTICATION_ERROR, t, this._fileName, 2293))
        } catch (r) {
            return t = "mifare authentication error", e(t), Promise.reject(new NFCPortError(NFCPortError.AUTHENTICATION_ERROR, t, this._fileName, 2300))
        }
        e("typea_mifareAuth end")
    }
    async typeb_reqb_wupb(r, t, i, a) {
        let o, s, n, _, c, E, N, l;
        e("typeb_reqb_wupb begin"), o = [NFCPort100.NFC100_TYPEB_CMD_REQB, r, 0], t || (o[2] |= 8), i && (o[2] |= 16), a && (o[2] |= 32), s = ISO14443_4_CC_UNIT_MS(7680), s += 20;
        try {
            n = await this.InCommRF(o, s)
        } catch (e) {
            return e.errorType == NFCPortError.THRU_RESPONSE_PACKET_NOT_RECEIVED && (e.errorType = NFCPortError.CARD_NOT_DETECTED, e.message = "Card not detected"), Promise.reject(e)
        }
        return e("typeb_reqb_wupb ATQB=" + array_tohexs(n)), i && 12 != n.length && 13 != n.length || !i && 12 != n.length ? (_ = "Invalid ATQB length", e(_), Promise.reject(new NFCPortError(NFCPortError.CARD_NOT_DETECTED, _, this._fileName, 2354))) : (c = array_slice(n, 1, 4), E = array_slice(n, 5, 4), N = array_slice(n, 9, n.length - 9), l = new TypebCard(c, E, N), e("pupi : " + array_tohexs(c)), e("application_data : " + array_tohexs(E)), e("protocol_info : " + array_tohexs(N)), e("typeb_reqb_wupb end"), l)
    }
    async typeb_iso14443_4_activate(r, t, a, o, s, n) {
        let _, c, E, N, l, P, C, R, u, T, F, I, A, h, m;
        e("typeb_iso14443_4_activate begin"), e("  param pupi : " + array_tohexs(r)), e("  param fsdi : " + t), e("  param protocol_info : " + array_tohexs(a)), e("  param cid=" + o), e("  param autoBaudRate=" + n), _ = a[0] >> 4 & 3, c = 3 & a[0], E = 0, N = 0, !n || 0 == _ && 0 == c || (0 != (2 & _) && 0 != (2 & c) ? (E = 2, N = 2) : 0 != (1 & _) && 0 != (1 & c) && (E = 1, N = 1)), l = 9, null != s && 0 != s.length ? (e("  param higher_layer_inf=" + array_tohexs(s)), l += s.length) : e("  param higher_layer_inf=(null)"), P = new Uint8Array(l), P[0] = NFCPort100.NFC100_TYPEB_CMD_ATTRIB, array_copy(P, 1, r, 0, 4), P[5] = 0, P[6] = E << 6 & 192 | N << 4 & 48 | t, P[7] = 15 & a[1], P[8] = o, null != s && 0 != s.length && array_copy(P, 9, s, 0, s.length), C = 4, R = ISO14443_4_CC_FWT(4), R += i, R += 20;
        try {
            u = await this.InCommRF(P, R)
        } catch (e) {
            return e.errorType == NFCPortError.THRU_RESPONSE_PACKET_NOT_RECEIVED && (e.errorType = NFCPortError.CARD_NOT_DETECTED, e.message = "Card not detected"), Promise.reject(e)
        }
        if (e("typeb attrib_data=" + array_tohexs(u)), u.length > NFCPort100.TYPEB_CARD_MAX_ATTRIB_LEN) return T = "Invalid attrib_data length", e(T), Promise.reject(new NFCPortError(NFCPortError.CARD_NOT_DETECTED, T, this._fileName, 2451));
        F = ReaderWriterBase.BAUDRATE_106K, 0 == E && 0 == N || (2 == E ? (I = NFCPort100.NFC100_RBT_INITIATOR_ISO14443B_424K, A = NFCPort100.NFC100_RF_INITIATOR_ISO14443B_424K, F = ReaderWriterBase.BAUDRATE_424K) : 1 == E ? (I = NFCPort100.NFC100_RBT_INITIATOR_ISO14443B_212K, A = NFCPort100.NFC100_RF_INITIATOR_ISO14443B_212K, F = ReaderWriterBase.BAUDRATE_212K) : (I = NFCPort100.NFC100_RBT_INITIATOR_ISO14443B_106K, A = NFCPort100.NFC100_RF_INITIATOR_ISO14443B_106K), 2 == N ? (h = NFCPort100.NFC100_RBT_INITIATOR_ISO14443B_424K, m = NFCPort100.NFC100_RF_INITIATOR_ISO14443B_424K) : 1 == N ? (h = NFCPort100.NFC100_RBT_INITIATOR_ISO14443B_212K, m = NFCPort100.NFC100_RF_INITIATOR_ISO14443B_212K) : (h = NFCPort100.NFC100_RBT_INITIATOR_ISO14443B_106K, m = NFCPort100.NFC100_RF_INITIATOR_ISO14443B_106K), await this.InSetRF(I, A, h, m)), this.targetCardBaudRate = F, await wait_async(NFCPort100.ISO14443_4_CC_DEFAULT_SFGI), e("typeb_iso14443_4_activate end")
    }
    async setCommunicateThruProtocol(r) {
        e("setCommunicateThruProtocol begin");
        let t = NFCPort100.felica_default_protocol;
        this.protocol == ReaderWriterBase.PROTOCOL_FELICA || this.protocol == ReaderWriterBase.PROTOCOL_ISO18092 ? t = NFCPort100.felica_default_protocol : this.protocol == ReaderWriterBase.PROTOCOL_ISO14443_3A || this.protocol == ReaderWriterBase.PROTOCOL_ISO14443_4A ? t = NFCPort100.typea_default_protocol : this.protocol == ReaderWriterBase.PROTOCOL_ISO14443_4B && (t = NFCPort100.typeb_default_protocol);
        let i = [1, t[3], 2, t[5], 4, t[9], 5, t[11], 7, t[15]];
        if (null != r) {
            let t = 1;
            if (null != r.appendCrc && (r.appendCrc ? i[t] = 1 : i[t] = 0), t += 2, null != r.discardCrc && (r.discardCrc ? i[t] = 1 : i[t] = 0), t += 2, null != r.insertParity && (r.insertParity ? i[t] = 1 : i[t] = 0), t += 2, null != r.expectParity && (r.expectParity ? i[t] = 1 : i[t] = 0), t += 2, null != r.txNumberOfValidBits) {
                if (!(1 <= r.txNumberOfValidBits && r.txNumberOfValidBits <= 8)) {
                    const r = "Invalid TX number of valid bits";
                    return e(r), Promise.reject(new NFCPortError(NFCPortError.INVALID_PARAMETER, r, this._fileName, 2566))
                }
                i[t] = r.txNumberOfValidBits
            }
        }
        await this.InSetProtocol(i), e("setCommunicateThruProtocol end")
    }
    getUpdateProtocol(e) {
        if (this.currentProtocol.length == e.length / 2 + 1) return e;
        {
            let r = new Array;
            for (let t = 0; t < e.length; t += 2) null != this.currentProtocol[e[t]] && this.currentProtocol[e[t]] == e[t + 1] || r.push(e[t], e[t + 1]);
            return r
        }
    }
    setCurrentProtocol(e) {
        for (let r = 0; r < e.length; r += 2) this.currentProtocol[e[r]] = e[r + 1]
    }
    getDeviceInfo(e) {
        return NFCPort100.getDeviceInfo(e)
    }
}
class NFCPort400 extends ReaderWriterBase {
    static get DEVICE_INFO_LIST() {
        return [{
            productId: 3528,
            modelName: "RC-S300/S",
            deviceType: "External"
        }, {
            productId: 3529,
            modelName: "RC-S300/P",
            deviceType: "External"
        }, {
            productId: 3471,
            modelName: "RC-S660",
            deviceType: "Internal"
        }]
    }
    static getDeviceInfo(e) {
        return ReaderWriterBase.getDeviceInfo(NFCPort400.DEVICE_INFO_LIST, e)
    }
    static hasProductId(e) {
        return ReaderWriterBase.hasProductId(NFCPort400.DEVICE_INFO_LIST, e)
    }
    static get SELECT_CONFIG() {
        return 1
    }
    static get CLAIM_INTERFACE() {
        return 1
    }
    static get ENDPOINT_IN() {
        return 2
    }
    static get ENDPOINT_OUT() {
        return 2
    }
    static get MAX_RESPONSE_PACKET_SIZE() {
        return 11 + ReaderWriterBase.DIAGNOSE_COMMUNICATION_LINE_SIZE_MAX + 2
    }
    static get GET_FW_VER_PARAM_TOTAL_0() {
        return 0
    }
    static get GET_FW_VER_PARAM_TOTAL_1() {
        return 1
    }
    static get GET_FW_VER_PARAM_TOTAL_2() {
        return 2
    }
    static get GET_FW_VER_PARAM_TOTAL_3() {
        return 3
    }
    static get GET_FW_VER_PARAM_MCU_0() {
        return 4
    }
    static get GET_FW_VER_PARAM_MCU_1() {
        return 5
    }
    static get GET_FW_VER_PARAM_SAM_0() {
        return 6
    }
    static get GET_FW_VER_PARAM_SAM_1() {
        return 7
    }
    static get GET_FW_VER_PARAM_RFFE_0() {
        return 8
    }
    static get GET_FW_VER_PARAM_RFFE_1() {
        return 9
    }
    static get GET_FW_VER_PARAM_RFFE_EEPROM_0() {
        return 10
    }
    static get GET_FW_VER_PARAM_RFFE_EEPROM_1() {
        return 11
    }
    static get GET_FW_VER_PARAM_BOOT_LOADER_0() {
        return 12
    }
    static get GET_FW_VER_PARAM_BOOT_LOADER_1() {
        return 13
    }
    static get GET_FW_VER_PARAM_UPDATE_STATE_0() {
        return 14
    }
    static get GET_FW_VER_PARAM_UPDATE_STATE_1() {
        return 15
    }
    static get GET_FW_VER_PARAM_BOOT_STATE_0() {
        return 16
    }
    static get GET_FW_VER_PARAM_BOOT_STATE_1() {
        return 17
    }
    static get GET_DATA_COMMMUNICATION_SPEED_106K() {
        return 1
    }
    static get GET_DATA_COMMMUNICATION_SPEED_212K() {
        return 2
    }
    static get GET_DATA_COMMMUNICATION_SPEED_424K() {
        return 3
    }
    static get GET_DATA_COMMMUNICATION_SPEED_848K() {
        return 4
    }
    static get RF_SPEED_RW_TO_CARD() {
        return 0
    }
    static get RF_SPEED_CARD_TO_RW() {
        return 1
    }
    static get RF_SPEED_FIXED_VALUE() {
        return [
            [1, 1],
            [1, 1],
            [2, 2]
        ]
    }
    static get RF_SPEED_PROTOCOL_NUM() {
        return NFCPort400.RF_SPEED_FIXED_VALUE.length
    }
    static get GET_PROPERTY_HARDWARE_VERSION() {
        return 1
    }
    static get GET_PROPERTY_MODEL_ID() {
        return 2
    }
    static get GET_PROPERTY_SERIAL_NO() {
        return 3
    }
    static get GET_PROPERTY_GROUP_NO() {
        return 8
    }
    static get GET_PROPERTY_SIZE_HARDWARE_VERSION() {
        return 16
    }
    static get GET_PROPERTY_SIZE_MODEL_ID() {
        return 8
    }
    static get GET_PROPERTY_SIZE_SERIAL_NO() {
        return 7
    }
    static get RF_ON_GUARD_TIME() {
        return 21
    }
    static get RF_OFF_GUARD_TIME() {
        return 30
    }
    static get SEQUENCE_ERROR_RETRY_COUNT() {
        return 2
    }
    static get SLOT_BUSY_RETRY_COUNT() {
        return 1
    }
    static get SLOT_BUSY_END_TRANSPARENT_RETRY_COUNT() {
        return 4
    }
    static get SLOT_BUSY_WAIT_TIME() {
        return 50
    }
    static get RFFE_PARAM_EEPROM() {
        return 1
    }
    static get RFFE_PARAM_PD_SC_DPC() {
        return 2
    }
    static get RFFE_PARAM_PROTOCOL_CONFIGURATION() {
        return 3
    }
    static get RFFE_PARAM_PRODUCTION_DATA() {
        return 1
    }
    static get RFFE_PARAM_SYSTEM_CONFIGURAION() {
        return 2
    }
    static get RFFE_PARAM_DPC() {
        return 3
    }
    constructor(e) {
        super(e, "NFCPort400"), this._fileName = "NFCPort400.js", this.pcsc = new Pcsc(e), this.originalRFSpeed = new Array(NFCPort400.RF_SPEED_PROTOCOL_NUM), this._modifiedTransmissionAndReceptionFlag = !1, this._modifiedTransmissionBitFraming = !1
    }
    async init(r) {
        e("init begin"), await super.init(r), this.pcsc.receiveTimeout = r.receiveTimeout, e("init end")
    }
    async open() {
        let r;
        e("open begin"), await super.open(NFCPort400.SELECT_CONFIG, NFCPort400.CLAIM_INTERFACE, NFCPort400.ENDPOINT_OUT, NFCPort400.ENDPOINT_IN, NFCPort400.MAX_RESPONSE_PACKET_SIZE);
        try {
            if (r = await this.pcsc.getFirmwareVersion(), 255 != r[NFCPort400.GET_FW_VER_PARAM_UPDATE_STATE_0] || 255 != r[NFCPort400.GET_FW_VER_PARAM_UPDATE_STATE_1]) return this.isUpdateMode = !0, void e("open end");
            this.isUpdateMode = !1
        } catch (r) {
            return await super.close(), e("open end"), Promise.reject(r)
        }
        this.config.autoBaudRate || await this.setFixedRFSpeed();
        try {
            await this.pcsc.startTransparentSession(this.config.priorityLibrary), await this.setFeliCaProtocol();
            const t = 4,
                i = (await this.pcsc.getProperty(NFCPort400.GET_PROPERTY_GROUP_NO))[t];
            let a;
            1 == i ? a = ReaderWriterBase.DEVICE_TYPE_INTERNAL : 2 == i ? a = ReaderWriterBase.DEVICE_TYPE_EXTERNAL : (e("can't get deviceType"), a = ReaderWriterBase.DEVICE_TYPE_UNKNOWN), this.deviceType != a && e("device returns other devicetype"), this.deviceType = a;
            const o = r[NFCPort400.GET_FW_VER_PARAM_TOTAL_0].toString(16),
                s = r[NFCPort400.GET_FW_VER_PARAM_TOTAL_1].toString(16),
                n = r[NFCPort400.GET_FW_VER_PARAM_TOTAL_2].toString(16),
                _ = r[NFCPort400.GET_FW_VER_PARAM_TOTAL_3].toString(16);
            this.firmwareVersion = o + "." + s + "." + n + "." + _;
            const c = await this.pcsc.getProperty(NFCPort400.GET_PROPERTY_SERIAL_NO);
            this.serialNumber = "", c.forEach(e => {
                this.serialNumber += String.fromCharCode(e)
            })
        } catch (r) {
            return r.errorType == NFCPortError.GET_ACCESS_AUTHORITY_ERROR ? await super.close() : await this.close(), e("open end"), Promise.reject(r)
        }
        e("open end")
    }
    async detectCard(r, t) {
        let i;
        e("detectCard begin");
        try {
            i = await super.detectCard(r, t)
        } catch (e) {
            return e.errorType == NFCPortError.THRU_RESPONSE_PACKET_NOT_RECEIVED && (e.errorType = NFCPortError.CARD_NOT_DETECTED, e.message = "Card not detected"), Promise.reject(e)
        }
        return this._modifiedTransmissionAndReceptionFlag = !1, this._modifiedTransmissionBitFraming = !1, e("detectCard end"), i
    }
    async communicateThru(r, t, i) {
        e("communicateThru begin");
        let a = await super.communicateThru(r, t, i);
        return e("communicateThru end"), a
    }
    async switchRF(r) {
        e("switchRF begin"), await super.switchRF(r), e("switchRF end")
    }
    async close() {
        if (e("close begin"), !this.bAbnormalState) try {
            await this.pcsc.endTransparentSession(), this.config.autoBaudRate || await this.resetRFSpeed()
        } catch (e) {}
        this._modifiedTransmissionAndReceptionFlag = !1, this._modifiedTransmissionBitFraming = !1, await super.close(), e("close end")
    }
    async prepareUpdateFirmware(r) {
        e("prepareUpdateFirmware begin");
        let t = await this.pcsc.prepareUpdateFirmware(r);
        if (e("prepareUpdateFirmware end"), null != t && t.length > 0) return t[0];
        {
            const r = "prepareUpdateFirmware Invalid Response";
            return e(r), Promise.reject(new NFCPortError(NFCPortError.INVALID_PARAMETER, r, this._fileName, 259))
        }
    }
    async updateFirmware(r, t) {
        e("updateFirmware begin");
        let i = await this.pcsc.updateFirmware(r, t);
        if (e("updateFirmware end"), null != i && i.length > 1) return i[1] << 8 | i[0];
        {
            const r = "updateFirmware Invalid Response";
            return e(r), Promise.reject(new NFCPortError(NFCPortError.INVALID_PARAMETER, r, this._fileName, 272))
        }
    }
    async resetDevice(r) {
        e("resetDevice begin");
        try {
            await this.pcsc.resetDevice(r)
        } catch (e) {
            if (!this.isUpdateMode) return Promise.reject(e)
        }
        e("resetDevice end")
    }
    async getFirmwareVersion() {
        e("getFirmwareVersion begin");
        let r = await this.pcsc.getFirmwareVersion();
        return e("getFirmwareVersion end"), r
    }
    async getModelID() {
        e("getModelID begin");
        let r = await this.pcsc.getProperty(NFCPort400.GET_PROPERTY_MODEL_ID);
        return e("getModelID end"), r
    }
    async startRFFEParameterMode() {
        e("startRFFEParameterMode begin"), await this.pcsc.endTransparentSession(), e("startRFFEParameterMode end")
    }
    async endRFFEParameterMode() {
        e("endRFFEParameterMode begin"), await this.pcsc.startTransparentSession(this.config.priorityLibrary), e("endRFFEParameterMode end")
    }
    async readRFFEParameter(r, t, i) {
        e("readRFFEParameter begin");
        let a = await this.pcsc.readRFFEParameter(r, t, i);
        return e("readRFFEParameter end"), a
    }
    async writeRFFEParameter(r, t, i) {
        e("writeRFFEParameter begin");
        let a = await this.pcsc.writeRFFEParameter(r, t, i);
        return e("writeRFFEParameter end"), a
    }
    async setFeliCaProtocol() {
        let e = await this.pcsc.switchProtocolTypeF(!1);
        return this.protocol = ReaderWriterBase.PROTOCOL_FELICA, e
    }
    async sendFeliCaPolling(e, r) {
        return await this.pcsc.transceive(e, r)
    }
    async setFeliCaSpeed(e, r) {
        await this.pcsc.switchProtocolTypeF(!0), this.targetCardBaudRate = await this.getTargetCardBaudRate()
    }
    async detectCard_TypeA(r) {
        if (e("detectCard_TypeA begin"), this.protocol == ReaderWriterBase.PROTOCOL_ISO14443_3A) await this.pcsc.switchProtocolISO14443_3A();
        else if (this.protocol == ReaderWriterBase.PROTOCOL_ISO14443_4A) {
            let e, t;
            e = null != r.fsdi ? r.fsdi : ReaderWriterBase.TYPEA_DEFAULT_FSDI, t = null != r.cid ? r.cid : ReaderWriterBase.TYPEA_DEFAULT_CID, await this.pcsc.switchProtocolISO14443_4A(e, t)
        }
        this.targetCardBaudRate = await this.getTargetCardBaudRate();
        const t = await this.pcsc.getData(),
            i = new TargetCard(null, null, t, null, null, null);
        return e("detectCard_TypeA end"), i
    }
    async detectCard_TypeB(r) {
        let t, i;
        e("detectCard_TypeB begin"), t = null != r.fsdi ? r.fsdi : ReaderWriterBase.TYPEB_DEFAULT_FSDI, i = null != r.cid ? r.cid : ReaderWriterBase.TYPEB_DEFAULT_CID, await this.pcsc.switchProtocolISO14443_4B(t, i), this.targetCardBaudRate = await this.getTargetCardBaudRate();
        const a = await this.pcsc.getData(),
            o = new TargetCard(null, null, null, a, null, null);
        return e("detectCard_TypeB end"), o
    }
    async detectCard_TypeV(r) {
        e("detectCard_TypeV begin"), await this.pcsc.switchProtocolISO15693(), this.targetCardBaudRate = ReaderWriterBase.BAUDRATE_26K;
        const t = await this.pcsc.getData(),
            i = new TargetCard(null, null, t, null, null, null);
        return e("detectCard_TypeV end"), i
    }
    async getTargetCardBaudRate() {
        let e = null;
        switch ((await this.pcsc.getData(Pcsc.GET_CARD_BAUDRATE))[0]) {
            case NFCPort400.GET_DATA_COMMMUNICATION_SPEED_106K:
                e = ReaderWriterBase.BAUDRATE_106K;
                break;
            case NFCPort400.GET_DATA_COMMMUNICATION_SPEED_212K:
                e = ReaderWriterBase.BAUDRATE_212K;
                break;
            case NFCPort400.GET_DATA_COMMMUNICATION_SPEED_424K:
                e = ReaderWriterBase.BAUDRATE_424K;
                break;
            case NFCPort400.GET_DATA_COMMMUNICATION_SPEED_848K:
                e = ReaderWriterBase.BAUDRATE_848K
        }
        return e
    }
    async typea_mifareAuth(r) {
        e("typea_mifareAuth begin"), await this.pcsc.loadKeys(Array.from(r.key)), await this.pcsc.generateAutheticate(r.blockNumber, r.keyType), e("typea_mifareAuth end")
    }
    async sendThruCommand(r, t, i) {
        let a, o = {
                appendCrc: null,
                discardCrc: null,
                insertParity: null,
                expectParity: null,
                appendProtocolPrologue: null
            },
            s = null;
        if (this._modifiedTransmissionAndReceptionFlag && (o = this.getDefaultTransmissionAndReceptionFlags(), this._modifiedTransmissionAndReceptionFlag = !1), this._modifiedTransmissionBitFraming && (s = 0, this._modifiedTransmissionBitFraming = !1), null != i && (null == i.appendCrc && null == i.discardCrc && null == i.insertParity && null == i.expectParity || (o = this.getDefaultTransmissionAndReceptionFlags(), null != i.appendCrc && (o.appendCrc = i.appendCrc), null != i.discardCrc && (o.discardCrc = i.discardCrc), null != i.insertParity && (o.insertParity = i.insertParity), null != i.expectParity && (o.expectParity = i.expectParity)), null != i.txNumberOfValidBits)) {
            if (!(1 <= i.txNumberOfValidBits && i.txNumberOfValidBits <= 8)) {
                const r = "Invalid TX number of valid bits";
                return e(r), Promise.reject(new NFCPortError(NFCPortError.INVALID_PARAMETER, r, this._fileName, 531))
            }
            s = i.txNumberOfValidBits
        }
        if (null != r && r.length > 0) {
            t < ReaderWriterBase.COMMUNICATE_THRU_MIN_TIMEOUT && (t = ReaderWriterBase.COMMUNICATE_THRU_MIN_TIMEOUT);
            let e = await this.pcsc.transceive(r, t, o.appendCrc, o.discardCrc, o.insertParity, o.expectParity, o.appendProtocolPrologue, s);
            a = new Uint8Array(e), null != i && (null == i.appendCrc && null == i.discardCrc && null == i.insertParity && null == i.expectParity || (this._modifiedTransmissionAndReceptionFlag = !0), null != i.txNumberOfValidBits && (this._modifiedTransmissionBitFraming = !0))
        } else a = null;
        return a
    }
    getDefaultTransmissionAndReceptionFlags() {
        switch (this.protocol) {
            case ReaderWriterBase.PROTOCOL_FELICA:
            case ReaderWriterBase.PROTOCOL_ISO18092:
                return {
                    appendCrc: !0, discardCrc: !0, insertParity: !1, expectParity: !1, appendProtocolPrologue: !1
                };
            case ReaderWriterBase.PROTOCOL_ISO14443_3A:
            case ReaderWriterBase.PROTOCOL_ISO14443_4A:
                return {
                    appendCrc: !0, discardCrc: !0, insertParity: !0, expectParity: !0, appendProtocolPrologue: !1
                };
            case ReaderWriterBase.PROTOCOL_ISO14443_4B:
            case ReaderWriterBase.PROTOCOL_ISO15693:
                return {
                    appendCrc: !0, discardCrc: !0, insertParity: !1, expectParity: !1, appendProtocolPrologue: !1
                }
        }
        return {
            appendCrc: null,
            discardCrc: null,
            insertParity: null,
            expectParity: null,
            appendProtocolPrologue: null
        }
    }
    async rf_on() {
        e("rf_on begin"), await this.pcsc.turnOnTheRF(), e("rf_on end")
    }
    async rf_off() {
        e("rf_off begin"), await this.pcsc.turnOffTheRF(), e("rf_off end")
    }
    async self_diagnose(r, t, i) {
        let a;
        switch (e("self_diagnose begin"), r) {
            case ReaderWriterBase.DIAGNOSE_COMMUNICATION_LINE_TEST:
                a = ReaderWriterBase.DIAGNOSE_TESTNO_COMMUNICATION_LINE;
                break;
            case ReaderWriterBase.DIAGNOSE_ROM_TEST:
                a = ReaderWriterBase.DIAGNOSE_TESTNO_ROM;
                break;
            case ReaderWriterBase.DIAGNOSE_RAM_TEST:
                a = ReaderWriterBase.DIAGNOSE_TESTNO_RAM;
                break;
            case ReaderWriterBase.DIAGNOSE_POLLING_TEST:
                a = ReaderWriterBase.DIAGNOSE_TESTNO_POLLING;
                break;
            default:
                const r = "Invalid parameter";
                return e(r), Promise.reject(new NFCPortError(NFCPortError.INVALID_PARAMETER, r, this._fileName, 624))
        }
        const o = await this.pcsc.diagnose(a, t, i);
        if (e("self_diagnose end"), !(o.length > 0)) {
            const r = "self_diagnose Invalid Response";
            return e(r), Promise.reject(new NFCPortError(NFCPortError.INVALID_RESPONSE, r, this._fileName, 656))
        }
        if (o[0] != a) {
            const r = "Illegal Test No.";
            return e(r), Promise.reject(new NFCPortError(NFCPortError.INVALID_RESPONSE, r, this._fileName, 635))
        } {
            const t = new Uint8Array(o.slice(1));
            switch (r) {
                case ReaderWriterBase.DIAGNOSE_COMMUNICATION_LINE_TEST:
                    return new Uint8Array(t);
                case ReaderWriterBase.DIAGNOSE_ROM_TEST:
                    return Number(t);
                case ReaderWriterBase.DIAGNOSE_RAM_TEST:
                    return new Uint8Array(t);
                case ReaderWriterBase.DIAGNOSE_POLLING_TEST:
                    return Number(t);
                default:
                    const r = "Invalid parameter";
                    return e(r), Promise.reject(new NFCPortError(NFCPortError.INVALID_PARAMETER, r, this._fileName, 650))
            }
        }
    }
    async setFixedRFSpeed() {
        for (let r = 0; r < NFCPort400.RF_SPEED_PROTOCOL_NUM; r++) try {
            if (null == this.originalRFSpeed[r]) {
                const e = await this.pcsc.getRFSpeed(r);
                this.originalRFSpeed[r] = [e[NFCPort400.RF_SPEED_RW_TO_CARD], e[NFCPort400.RF_SPEED_CARD_TO_RW]]
            }
            const e = NFCPort400.RF_SPEED_FIXED_VALUE[r];
            await this.pcsc.setRFSpeed(r, e[NFCPort400.RF_SPEED_RW_TO_CARD], e[NFCPort400.RF_SPEED_CARD_TO_RW])
        } catch (t) {
            e("get/set RFSpeed failed: " + r + "."), this.originalRFSpeed[r] = null
        }
    }
    async resetRFSpeed() {
        for (let r = 0; r < NFCPort400.RF_SPEED_PROTOCOL_NUM; r++) try {
            null != this.originalRFSpeed[r] && (await this.pcsc.setRFSpeed(r, this.originalRFSpeed[r][NFCPort400.RF_SPEED_RW_TO_CARD], this.originalRFSpeed[r][NFCPort400.RF_SPEED_CARD_TO_RW]), this.originalRFSpeed[r] = null)
        } catch (t) {
            e("setRFSpeed failed: " + r + ".")
        }
    }
    getDeviceInfo(e) {
        return NFCPort400.getDeviceInfo(e)
    }
}
class Pcsc {
    static get START_TRANSPARENT_SESSION_TAG() {
        return 129
    }
    static get END_TRANSPARENT_SESSION_TAG() {
        return 130
    }
    static get TURN_OFF_THE_RF_TAG() {
        return 131
    }
    static get TURN_ON_THE_RF_TAG() {
        return 132
    }
    static get TRANSMISSION_AND_RECEPTION_FLAG_TAG() {
        return 144
    }
    static get TRANSMISSION_BIT_FRAMING_TAG() {
        return 145
    }
    static get RECEPTION_BIT_FRAMING() {
        return 146
    }
    static get TRANMIT_TAG() {
        return 147
    }
    static get RECEIVE_TAG() {
        return 148
    }
    static get TRANSCEIVE_TAG() {
        return 149
    }
    static get RESPONSE_STATUS_TAG() {
        return 150
    }
    static get RESPONSE_DATA_TAG() {
        return 151
    }
    static get SWITCH_PROTOCOL_TAG() {
        return 143
    }
    static get GET_UID() {
        return 0
    }
    static get GET_HISTORICAL_BYTES() {
        return 1
    }
    static get GET_CARD_ID() {
        return 240
    }
    static get GET_CARD_NAME() {
        return 241
    }
    static get GET_CARD_BAUDRATE() {
        return 242
    }
    static get GET_CARD_TYPE() {
        return 243
    }
    static get GET_CARD_TYPE_NAME() {
        return 244
    }
    constructor(e) {
        this._fileName = "NFCPort400.js", this.ccid = new UsbCcid(e), this.mifareAuthKeyNumber = 0, this._receiveTimeout = ReaderWriterBase.DEFAULT_RECEIVE_TIMEOUT
    }
    set receiveTimeout(e) {
        this._receiveTimeout = e
    }
    get receiveTimeout() {
        return this._receiveTimeout
    }
    async startTransparentSession(r) {
        e("startTransparentSession : start"), null != r && r && await this.manageSession([
            [Pcsc.END_TRANSPARENT_SESSION_TAG, 0]
        ], NFCPort400.SLOT_BUSY_END_TRANSPARENT_RETRY_COUNT), await this.manageSession([
            [Pcsc.START_TRANSPARENT_SESSION_TAG, 0]
        ]), await this.turnOffTheRF(), await wait_async(NFCPort400.RF_OFF_GUARD_TIME), await this.turnOnTheRF(), await wait_async(NFCPort400.RF_ON_GUARD_TIME), this.ccid.startAwakeTimer(), e("startTransparentSession : end")
    }
    async endTransparentSession() {
        e("endTransparentSession : start");
        try {
            this.ccid.stopAwakeTimer(), await this.turnOffTheRF()
        } catch (r) {
            e(r.message)
        }
        await this.manageSession([
            [Pcsc.END_TRANSPARENT_SESSION_TAG, 0]
        ], NFCPort400.SLOT_BUSY_END_TRANSPARENT_RETRY_COUNT), e("endTransparentSession : end")
    }
    async switchProtocolTypeF(r) {
        e("switchProtocolTypeF : start");
        let t = 0;
        r && (t = 1);
        const i = await this.switchProtocol(3, t);
        return e("switchProtocolTypeF : end"), i
    }
    async switchProtocolISO14443_3A() {
        e("switchProtocolISO14443_3A : start");
        const r = await this.switchProtocol(0, 3);
        return e("switchProtocolISO14443_3A : end"), r
    }
    async switchProtocolISO14443_4A(r, t) {
        e("switchProtocolISO14443_4A : start");
        const i = await this.switchProtocol(0, 4, r, t);
        return e("switchProtocolISO14443_4A : end"), i
    }
    async switchProtocolISO14443_4B(r, t) {
        e("switchProtocolISO14443_4B : start");
        const i = await this.switchProtocol(1, 4, r, t);
        return e("switchProtocolISO14443_4B : end"), i
    }
    async switchProtocolISO15693() {
        e("switchProtocolISO15693 : start");
        const r = await this.switchProtocol(2, 3);
        return e("switchProtocolISO15693 : end"), r
    }
    async transceive(r, t, i, a, o, s, n, _) {
        e("transceive : start");
        let c = await this.transparentExchange(Pcsc.TRANSCEIVE_TAG, r, t, i, a, o, s, n, _);
        return e("transceive : end"), c
    }
    async turnOnTheRF() {
        e("turnOnTheRF : start"), await this.manageSession([
            [Pcsc.TURN_ON_THE_RF_TAG, 0]
        ]), e("turnOnTheRF : end")
    }
    async turnOffTheRF() {
        e("turnOffTheRF : start"), await this.manageSession([
            [Pcsc.TURN_OFF_THE_RF_TAG, 0]
        ]), e("turnOffTheRF : end")
    }
    async manageSession(r, t) {
        let i = [255, 80, 0, 0],
            a = [];
        r.forEach(e => {
            a.push(...e)
        }), i.push(a.length), i.push(...a), i.push(0);
        let o = await this.ccid.escape(i, this.receiveTimeout, t),
            s = o.slice(o.length - 2);
        if (144 != s[0] || 0 != s[1]) {
            const r = "manageSession error: " + bytes2hexs([s[0], s[1]]);
            return e(r), Promise.reject(new NFCPortError(NFCPortError.INVALID_RESPONSE, r, this._fileName, 889))
        }
        e("manageSession : OK");
        let n = o.slice(0, o.length - 2);
        for (let r = 0; r < n.length - 1; r++) {
            let t, i = n[r];
            switch (i) {
                case 192:
                    if (t = n[++r], !(3 == t && r + t < n.length)) {
                        const r = "manageSession error.";
                        return e(r), Promise.reject(new NFCPortError(NFCPortError.INVALID_RESPONSE, r, this._fileName, 914))
                    }
                    if (0 != n[r + 1] || 144 != n[r + 2] || 0 != n[r + 3]) {
                        const t = "manageSession error: " + bytes2hexs([n[r + 1], n[r + 2], n[r + 3]]);
                        return e(t), 105 == n[r + 2] && 138 == n[r + 3] ? Promise.reject(new NFCPortError(NFCPortError.GET_ACCESS_AUTHORITY_ERROR, t, this._fileName, 906)) : Promise.reject(new NFCPortError(NFCPortError.INVALID_RESPONSE, t, this._fileName, 908))
                    }
                    r += t;
                    break;
                case 128:
                    if (t = n[++r], !(3 == t && r + t < n.length)) {
                        const r = "manageSession error.";
                        return e(r), Promise.reject(new NFCPortError(NFCPortError.INVALID_RESPONSE, r, this._fileName, 925))
                    }
                    n.slice(r + 1, r + 1 + t);
                    r += t;
                    break;
                case 255:
                    if (i = n[++r], 109 == i) {
                        if (t = n[++r], 3 != t && 6 != t || !(r + t < n.length)) {
                            const r = "manageSession error.";
                            return e(r), Promise.reject(new NFCPortError(NFCPortError.INVALID_RESPONSE, r, this._fileName, 938))
                        }
                        n.slice(r + 1, r + 1 + t);
                        r += t
                    } else r = n.length, e("manageSession unexpected TAG " + i);
                    break;
                default:
                    r = n.length, e("manageSession unexpected TAG " + i)
            }
        }
        return n
    }
    async transparentExchange(r, t, i, a, o, s, n, _, c) {
        let E = [];
        if (null != a || null != o || null != s || null != n || null != _) {
            const e = this.getTransmissionAndReceptionFlag(a, o, s, n, _);
            E.push(144, 2, e >> 8 & 255, 255 & e)
        }
        if (null != c) {
            let e = 0;
            c < 8 && (e = c), E.push(145, 1, e)
        }
        if (null != i && (i *= 1e3, E.push(95, 70, 4, 255 & i, i >> 8 & 255, i >> 16 & 255, i >> 24 & 255)), null != t) {
            const e = 130;
            E.push(r, e, t.length >> 8 & 255, 255 & t.length), E.push(...t)
        }
        let N = [255, 80, 0, 1];
        N.push(0, E.length >> 8 & 255, 255 & E.length), N.push(...E), N.push(0, 0, 0);
        let l, P = await this.ccid.escape(N, this.receiveTimeout),
            C = P.slice(P.length - 2);
        if (144 != C[0] || 0 != C[1]) {
            const r = "transparentExchange error: " + bytes2hexs([C[0], C[1]]);
            return e(r), Promise.reject(new NFCPortError(NFCPortError.INVALID_RESPONSE, r, this._fileName, 1010))
        }
        e("transparentExchange : OK");
        let R = P.slice(0, P.length - 2);
        for (let r = 0; r < R.length - 1; r++) {
            let t, i = R[r];
            switch (i) {
                case 192:
                    if (t = R[++r], !(3 == t && r + t < R.length)) {
                        const r = "transparentExchange error.";
                        return e(r), Promise.reject(new NFCPortError(NFCPortError.INVALID_RESPONSE, r, this._fileName, 1044))
                    }
                    if (0 != R[r + 1] || 144 != R[r + 2] || 0 != R[r + 3]) {
                        const t = "transparentExchange error: " + bytes2hexs([R[r + 1], R[r + 2], R[r + 3]]);
                        return e(t), 100 == R[r + 2] ? 0 == R[r + 3] ? Promise.reject(new NFCPortError(NFCPortError.THRU_RESPONSE_PACKET_NOT_RECEIVED, t, this._fileName, 1029)) : 1 == R[r + 3] ? Promise.reject(new NFCPortError(NFCPortError.THRU_RESPONSE_PACKET_NOT_RECEIVED, t, this._fileName, 1031)) : Promise.reject(new NFCPortError(NFCPortError.INVALID_RESPONSE, t, this._fileName, 1033)) : 99 == R[r + 2] && 1 == R[r + 3] ? Promise.reject(new NFCPortError(NFCPortError.INVALID_STATUS, t, this._fileName, 1036)) : Promise.reject(new NFCPortError(NFCPortError.INVALID_RESPONSE, t, this._fileName, 1038))
                    }
                    r += t;
                    break;
                case 146:
                    if (t = R[++r], !(1 == t && r + t < R.length)) {
                        const r = "transparentExchange Reception Bit Framing error.";
                        return e(r), Promise.reject(new NFCPortError(NFCPortError.INVALID_RESPONSE, r, this._fileName, 1055))
                    }
                    R[r + 1];
                    r += t;
                    break;
                case 150:
                    if (t = R[++r], !(2 == t && r + t < R.length)) {
                        const r = "transparentExchange Response Status error.";
                        return e(r), Promise.reject(new NFCPortError(NFCPortError.INVALID_RESPONSE, r, this._fileName, 1066))
                    }
                    R[r + 1];
                    r += t;
                    break;
                case 151:
                    if (t = R[++r], t >= 128) switch (t) {
                        case 129:
                            t = R[r + 1], r++;
                            break;
                        case 130:
                            t = (R[r + 1] << 8) + R[r + 2], r += 2;
                            break;
                        case 131:
                            t = (R[r + 1] << 16) + (R[r + 2] << 8) + R[r + 3], r += 3;
                            break;
                        case 132:
                            t = (R[r + 1] << 24) + (R[r + 2] << 16) + (R[r + 3] << 8) + R[r + 4], r += 4;
                            break;
                        default:
                            const i = "transparentExchange Response Data error.";
                            return e(i), Promise.reject(new NFCPortError(NFCPortError.INVALID_RESPONSE, i, this._fileName, 1092))
                    }
                    r + t < R.length && (l = Uint8Array.from(R.slice(r + 1, r + 1 + t)), r += t);
                    break;
                case 255:
                    if (i = R[++r], 109 == i && r + 1 < R.length) {
                        if (t = R[++r], 3 != t && 6 != t || !(r + t < R.length)) {
                            const r = "transparentExchange error.";
                            return e(r), Promise.reject(new NFCPortError(NFCPortError.INVALID_RESPONSE, r, this._fileName, 1114))
                        }
                        R.slice(r + 1, r + 1 + t);
                        r += t
                    } else r = R.length, e("transparentExchange unexpected TAG " + i);
                    break;
                default:
                    r = R.length, e("transparentExchange unexpected TAG " + i)
            }
        }
        return l
    }
    getTransmissionAndReceptionFlag(r, t, i, a, o) {
        let s = 0;
        return null != r ? r || (s |= 1) : e("appendCrc is nothing"), null != t ? t || (s |= 2) : e("discardCrc is nothing"), null != i ? i || (s |= 4) : e("insertParity is nothing"), null != a ? a || (s |= 8) : e("expectParity is nothing"), null != o ? o || (s |= 16) : e("appendProtocolPrologue is nothing"), s
    }
    async switchProtocol(r, t, i, a) {
        let o = [];
        null != i && o.push(255, 110, 3, 1, 1, i), null != a && o.push(255, 110, 3, 8, 1, a), o.push(Pcsc.SWITCH_PROTOCOL_TAG, 2, r, t);
        let s = [255, 80, 0, 2];
        s.push(o.length), s.push(...o), s.push(0);
        let n = await this.ccid.escape(s, this.receiveTimeout),
            _ = n.slice(n.length - 2);
        if (144 != _[0] || 0 != _[1]) {
            const r = "switchProtocol error: " + bytes2hexs([_[0], _[1]]);
            return e(r), Promise.reject(new NFCPortError(NFCPortError.INVALID_RESPONSE, r, this._fileName, 1220))
        }
        e("switchProtocol : OK");
        let c = n.slice(0, n.length - 2);
        for (let r = 0; r < c.length - 1; r++) {
            let t, i = c[r];
            switch (i) {
                case 192:
                    if (t = c[++r], !(3 == t && r + t < c.length)) {
                        const r = "switchProtocol error.";
                        return e(r), Promise.reject(new NFCPortError(NFCPortError.INVALID_RESPONSE, r, this._fileName, 1252))
                    }
                    if (0 != c[r + 1] || 144 != c[r + 2] || 0 != c[r + 3]) {
                        const t = "switchProtocol error: " + bytes2hexs([c[r + 1], c[r + 2], c[r + 3]]);
                        return e(t), 100 == c[r + 2] ? 0 == c[r + 3] ? Promise.reject(new NFCPortError(NFCPortError.THRU_RESPONSE_PACKET_NOT_RECEIVED, t, this._fileName, 1238)) : 1 == c[r + 3] ? Promise.reject(new NFCPortError(NFCPortError.THRU_RESPONSE_PACKET_NOT_RECEIVED, t, this._fileName, 1240)) : Promise.reject(new NFCPortError(NFCPortError.INVALID_RESPONSE, t, this._fileName, 1243)) : Promise.reject(new NFCPortError(NFCPortError.INVALID_RESPONSE, t, this._fileName, 1246))
                    }
                    r += t;
                    break;
                case 143:
                    if (t = c[++r], 1 == t && r + t < c.length) {
                        c[r + 1]
                    } else {
                        if (!(3 == t && r + t < c.length)) {
                            const r = "switchProtocol error.";
                            return e(r), Promise.reject(new NFCPortError(NFCPortError.INVALID_RESPONSE, r, this._fileName, 1264))
                        }
                        c[r + 1], c[r + 2], c[r + 3]
                    }
                    r += t;
                    break;
                case 95:
                    if (i = c[++r], !(81 == i && r + 1 < c.length)) {
                        const r = "switchProtocol ATR error.";
                        return e(r), Promise.reject(new NFCPortError(NFCPortError.INVALID_RESPONSE, r, this._fileName, 1282))
                    }
                    if (t = c[++r], !(r + t < c.length)) {
                        const r = "switchProtocol ATR error.";
                        return e(r), Promise.reject(new NFCPortError(NFCPortError.INVALID_RESPONSE, r, this._fileName, 1277))
                    }
                    r += t;
                    break;
                case 255:
                    if (i = c[++r], 109 == i && r + 1 < c.length) {
                        if (t = c[++r], 3 != t && 6 != t || !(r + t < c.length)) {
                            const r = "switchProtocol error.";
                            return e(r), Promise.reject(new NFCPortError(NFCPortError.INVALID_RESPONSE, r, this._fileName, 1295))
                        }
                        c.slice(r + 1, r + 1 + t);
                        r += t
                    } else r = c.length, e("switchProtocol unexpected TAG " + i);
                    break;
                default:
                    r = n.length, e("switchProtocol unexpected TAG " + i)
            }
        }
        return c
    }
    async getData(r) {
        e("getData : start"), null == r && (r = Pcsc.GET_UID);
        const t = new Uint8Array([255, 202, r, 0]);
        let i = await this.ccid.escape(t, this.receiveTimeout),
            a = new Uint8Array(i),
            o = a.slice(a.length - 2);
        if (144 != o[0] || 0 != o[1]) {
            const r = "getData : error " + bytes2hexs([o[0], o[1]]);
            return e(r), Promise.reject(new NFCPortError(NFCPortError.INVALID_RESPONSE, r, this._fileName, 1331))
        }
        return e("getData : OK"), e("getData : end"), a.slice(0, a.length - 2)
    }
    async loadKeys(r) {
        e("loadKeys : start");
        let t = [255, 130, 0, this.mifareAuthKeyNumber];
        t.push(r.length), t.push(...r);
        let i = await this.ccid.escape(t, this.receiveTimeout);
        if (144 != i[0] || 0 != i[1]) {
            const r = "loadKeys failed " + bytes2hexs([i[0], i[1]]);
            return e(r), Promise.reject(new NFCPortError(NFCPortError.AUTHENTICATION_ERROR, r, this._fileName, 1349))
        }
        e("loadKeys success"), e("loadKeys : end")
    }
    async generateAutheticate(r, t) {
        let i;
        e("generateAutheticate : start"), "KeyA" == t ? i = 96 : "KeyB" == t && (i = 97);
        let a = [255, 134, 0, 0, 5, 0, r >> 8 & 255, 255 & r, i, this.mifareAuthKeyNumber];
        const o = await this.ccid.escape(a, this.receiveTimeout);
        if (144 != o[0] || 0 != o[1]) {
            const r = "generateAutheticate failed " + bytes2hexs([o[0], o[1]]);
            return e(r), Promise.reject(new NFCPortError(NFCPortError.AUTHENTICATION_ERROR, r, this._fileName, 1369))
        }
        e("generateAutheticate success"), e("generateAutheticate : end")
    }
    async prepareUpdateFirmware(r) {
        e("prepareUpdateFirmware : start");
        let t = [255, 83, 0, 0, 0, 1, 0];
        t.push(...r);
        const i = await this.ccid.escape(Uint8Array.from(t), this.receiveTimeout);
        let a = new Uint8Array(i);
        const o = a.slice(0, a.length - 2),
            s = a.slice(a.length - 2);
        if (144 != s[0] || 0 != s[1]) {
            const r = "prepareUpdateFirmware : error " + bytes2hexs([s[0], s[1]]);
            return e(r), Promise.reject(new NFCPortError(NFCPortError.INVALID_RESPONSE, r, this._fileName, 1390))
        }
        return e("prepareUpdateFirmware : OK"), e("prepareUpdateFirmware : end"), o
    }
    async updateFirmware(r, t) {
        e("updateFirmware : start");
        let i = [255, 84, 255 & r, r >> 8 & 255, 0, 1, 0];
        i.push(...t);
        const a = await this.ccid.escape(Uint8Array.from(i), this.receiveTimeout);
        let o = new Uint8Array(a);
        const s = o.slice(0, o.length - 2),
            n = o.slice(o.length - 2);
        if (144 != n[0] || 0 != n[1]) {
            const r = "updateFirmware : error " + bytes2hexs([n[0], n[1]]);
            return e(r), Promise.reject(new NFCPortError(NFCPortError.INVALID_RESPONSE, r, this._fileName, 1413))
        }
        return e("updateFirmware : OK"), e("updateFirmware : end"), s
    }
    async resetDevice(r) {
        e("resetDevice : start");
        const t = new Uint8Array([255, 85, 0, 0, 2, 255 & r, r >> 8 & 255]);
        let i = await this.ccid.escape(t, this.receiveTimeout),
            a = new Uint8Array(i);
        const o = a.slice(0, a.length - 2),
            s = a.slice(a.length - 2);
        if (144 != s[0] || 0 != s[1]) {
            const r = "updateFirmware : error " + bytes2hexs([s[0], s[1]]);
            return e(r), Promise.reject(new NFCPortError(NFCPortError.INVALID_RESPONSE, r, this._fileName, 1434))
        }
        return e("updateFirmware : OK"), e("resetDevice : end"), o
    }
    async getFirmwareVersion() {
        e("getFirmwareVersion : start");
        const r = new Uint8Array([255, 86, 0, 0]);
        let t = await this.ccid.escape(r, this.receiveTimeout),
            i = new Uint8Array(t);
        const a = i.slice(0, i.length - 2),
            o = i.slice(i.length - 2);
        if (144 != o[0] || 0 != o[1]) {
            const r = "getFirmwareVersion : error " + bytes2hexs([o[0], o[1]]);
            return e(r), Promise.reject(new NFCPortError(NFCPortError.INVALID_RESPONSE, r, this._fileName, 1454))
        }
        return e("getFirmwareVersion : OK"), e("getFirmwareVersion : end"), a
    }
    async diagnose(r, t, i) {
        e("diagnose : start");
        let a = [255, 87, 0, 0];
        switch (r) {
            case ReaderWriterBase.DIAGNOSE_TESTNO_COMMUNICATION_LINE:
                const r = 1 + t.length;
                a.push(0, r >> 8 & 255, 255 & r), a.push(ReaderWriterBase.DIAGNOSE_TESTNO_COMMUNICATION_LINE), a.push(...t), a.push(0, 0, 0);
                break;
            case ReaderWriterBase.DIAGNOSE_TESTNO_ROM:
                a.push(1), a.push(ReaderWriterBase.DIAGNOSE_TESTNO_ROM);
                break;
            case ReaderWriterBase.DIAGNOSE_TESTNO_RAM:
                a.push(1), a.push(ReaderWriterBase.DIAGNOSE_TESTNO_RAM);
                break;
            case ReaderWriterBase.DIAGNOSE_TESTNO_POLLING:
                a.push(3), a.push(ReaderWriterBase.DIAGNOSE_TESTNO_POLLING);
                const o = t,
                    s = i;
                let n;
                if (o == ReaderWriterBase.PROTOCOL_ISO18092 || o == ReaderWriterBase.PROTOCOL_FELICA) {
                    n = 2
                } else if (o == ReaderWriterBase.PROTOCOL_ISO14443_3A || o == ReaderWriterBase.PROTOCOL_ISO14443_4A) {
                    n = 0
                } else if (o == ReaderWriterBase.PROTOCOL_ISO14443_4B) {
                    n = 1
                } else {
                    if (o != ReaderWriterBase.PROTOCOL_ISO15693) {
                        const r = "Invalid parameter (protocol)";
                        return e(r), Promise.reject(new NFCPortError(NFCPortError.INVALID_PARAMETER, r, this._fileName, 1502))
                    }
                    n = 3
                }
                a.push(n), a.push(s);
                break;
            default:
                const _ = "Invalid parameter";
                return e(_), Promise.reject(new NFCPortError(NFCPortError.INVALID_PARAMETER, _, this._fileName, 1510))
        }
        const o = await this.ccid.escape(new Uint8Array(a), this.receiveTimeout),
            s = o.slice(o.length - 2);
        if (144 != s[0] || 0 != s[1]) {
            const r = "diagnose : error " + bytes2hexs([s[0], s[1]]);
            return e(r), Promise.reject(new NFCPortError(NFCPortError.INVALID_RESPONSE, r, this._fileName, 1521))
        }
        e("diagnose : OK");
        const n = o.slice(0, o.length - 2);
        switch (r) {
            case ReaderWriterBase.DIAGNOSE_TESTNO_COMMUNICATION_LINE:
                if (n.length != 1 + t.length) {
                    const r = "self_diagnose Invalid Response";
                    return e(r), Promise.reject(new NFCPortError(NFCPortError.INVALID_RESPONSE, r, this._fileName, 1530))
                }
                if (n[0] != ReaderWriterBase.DIAGNOSE_TESTNO_COMMUNICATION_LINE) {
                    const r = "self_diagnose Invalid Response";
                    return e(r), Promise.reject(new NFCPortError(NFCPortError.INVALID_RESPONSE, r, this._fileName, 1534))
                }
                break;
            case ReaderWriterBase.DIAGNOSE_TESTNO_ROM:
                if (2 != n.length) {
                    const r = "self_diagnose Invalid Response";
                    return e(r), Promise.reject(new NFCPortError(NFCPortError.INVALID_RESPONSE, r, this._fileName, 1543))
                }
                if (n[0] != ReaderWriterBase.DIAGNOSE_TESTNO_ROM) {
                    const r = "self_diagnose Invalid Response";
                    return e(r), Promise.reject(new NFCPortError(NFCPortError.INVALID_RESPONSE, r, this._fileName, 1547))
                }
                break;
            case ReaderWriterBase.DIAGNOSE_TESTNO_RAM:
                if (n.length <= 0 || 7 < n.length) {
                    const r = "self_diagnose Invalid Response";
                    return e(r), Promise.reject(new NFCPortError(NFCPortError.INVALID_RESPONSE, r, this._fileName, 1556))
                }
                if (n[0] != ReaderWriterBase.DIAGNOSE_TESTNO_RAM) {
                    const r = "self_diagnose Invalid Response";
                    return e(r), Promise.reject(new NFCPortError(NFCPortError.INVALID_RESPONSE, r, this._fileName, 1560))
                }
                break;
            case ReaderWriterBase.DIAGNOSE_TESTNO_POLLING:
                if (2 != n.length) {
                    const r = "self_diagnose Invalid Response";
                    return e(r), Promise.reject(new NFCPortError(NFCPortError.INVALID_RESPONSE, r, this._fileName, 1569))
                }
                if (n[0] != ReaderWriterBase.DIAGNOSE_TESTNO_POLLING) {
                    const r = "self_diagnose Invalid Response";
                    return e(r), Promise.reject(new NFCPortError(NFCPortError.INVALID_RESPONSE, r, this._fileName, 1573))
                }
                break;
            default:
                const r = "Invalid parameter";
                return e(r), Promise.reject(new NFCPortError(NFCPortError.INVALID_PARAMETER, r, this._fileName, 1581))
        }
        return e("diagnose : end"), new Uint8Array(n)
    }
    async setRFSpeed(r, t, i) {
        e("setRFSpeed : start");
        const a = new Uint8Array([255, 92, 0, 0, 3, r, t, i]),
            o = await this.ccid.escape(a, this.receiveTimeout),
            s = o.slice(o.length - 2);
        if (144 != s[0] || 0 != s[1]) {
            const r = "setRFSpeed : error " + bytes2hexs([s[0], s[1]]);
            return e(r), Promise.reject(new NFCPortError(NFCPortError.INVALID_RESPONSE, r, this._fileName, 1599))
        }
        return e("setRFSpeed : OK"), e("setRFSpeed : end"), new Uint8Array(o.slice(0, o.length - 2))
    }
    async getRFSpeed(r) {
        e("getRFSpeed : start");
        const t = new Uint8Array([255, 93, 0, 0, 1, r]),
            i = await this.ccid.escape(t, this.receiveTimeout),
            a = i.slice(i.length - 2);
        if (144 != a[0] || 0 != a[1]) {
            const r = "getRFSpeed : error " + bytes2hexs([a[0], a[1]]);
            return e(r), Promise.reject(new NFCPortError(NFCPortError.INVALID_RESPONSE, r, this._fileName, 1618))
        }
        return e("getRFSpeed : OK"), e("getRFSpeed : end"), new Uint8Array(i.slice(0, i.length - 2))
    }
    async getProperty(r) {
        e("getProperty : start");
        const t = new Uint8Array([255, 95, r, 0]),
            i = await this.ccid.escape(t, this.receiveTimeout),
            a = i.slice(i.length - 2);
        if (144 != a[0] || 0 != a[1]) {
            const r = "getProperty : error " + bytes2hexs([a[0], a[1]]);
            return e(r), Promise.reject(new NFCPortError(NFCPortError.INVALID_RESPONSE, r, this._fileName, 1637))
        }
        return e("getProperty : OK"), e("getProperty : end"), new Uint8Array(i.slice(0, i.length - 2))
    }
    async readRFFEParameter(r, t, i) {
        e("readRFFEParameter : start");
        let a = [255, 97, r, t];
        switch (r) {
            case NFCPort400.RFFE_PARAM_EEPROM:
                if (0 != t) {
                    const r = "Invalid parameter";
                    return e(r), Promise.reject(new NFCPortError(NFCPortError.INVALID_PARAMETER, r, this._fileName, 1656))
                }
                a.push(i.length), a.push(...i);
                break;
            case NFCPort400.RFFE_PARAM_PD_SC_DPC:
                if (t == NFCPort400.RFFE_PARAM_PRODUCTION_DATA);
                else if (t == NFCPort400.RFFE_PARAM_SYSTEM_CONFIGURAION);
                else if (t != NFCPort400.RFFE_PARAM_DPC) {
                    const r = "Invalid parameter";
                    return e(r), Promise.reject(new NFCPortError(NFCPortError.INVALID_PARAMETER, r, this._fileName, 1669))
                }
            case NFCPort400.RFFE_PARAM_PROTOCOL_CONFIGURATION:
                break;
            default:
                const r = "Invalid parameter";
                return e(r), Promise.reject(new NFCPortError(NFCPortError.INVALID_PARAMETER, r, this._fileName, 1677))
        }
        const o = await this.ccid.escape(new Uint8Array(a), this.receiveTimeout),
            s = o.slice(o.length - 2);
        if (144 != s[0] || 0 != s[1]) {
            const r = "readRFFEParameter : error " + bytes2hexs([s[0], s[1]]);
            return e(r), Promise.reject(new NFCPortError(NFCPortError.INVALID_RESPONSE, r, this._fileName, 1687))
        }
        return e("readRFFEParameter : OK"), e("readRFFEParameter : end"), new Uint8Array(o.slice(0, o.length - 2))
    }
    async writeRFFEParameter(r, t, i) {
        e("writeRFFEParameter : start");
        let a = [255, 98, r, t];
        switch (r) {
            case NFCPort400.RFFE_PARAM_EEPROM:
                if (0 != t) {
                    const r = "Invalid parameter";
                    return e(r), Promise.reject(new NFCPortError(NFCPortError.INVALID_PARAMETER, r, this._fileName, 1706))
                }
                a.push(i.length), a.push(...i);
                break;
            case NFCPort400.RFFE_PARAM_PD_SC_DPC:
                if (t == NFCPort400.RFFE_PARAM_SYSTEM_CONFIGURAION) a.push(i.length), a.push(...i);
                else {
                    if (t != NFCPort400.RFFE_PARAM_DPC) {
                        const r = "Invalid parameter";
                        return e(r), Promise.reject(new NFCPortError(NFCPortError.INVALID_PARAMETER, r, this._fileName, 1719))
                    }
                    a.push(i.length), a.push(...i)
                }
                break;
            case NFCPort400.RFFE_PARAM_PROTOCOL_CONFIGURATION:
                a.push(i.length), a.push(...i);
                break;
            default:
                const r = "Invalid parameter";
                return e(r), Promise.reject(new NFCPortError(NFCPortError.INVALID_PARAMETER, r, this._fileName, 1729))
        }
        const o = await this.ccid.escape(new Uint8Array(a), this.receiveTimeout),
            s = o.slice(o.length - 2);
        if (144 != s[0] || 0 != s[1]) {
            const r = "writeRFFEParameter : error " + bytes2hexs([s[0], s[1]]);
            return e(r), Promise.reject(new NFCPortError(NFCPortError.INVALID_RESPONSE, r, this._fileName, 1739))
        }
        return e("writeRFFEParameter : OK"), e("writeRFFEParameter : end"), new Uint8Array(o.slice(0, o.length - 2))
    }
}
class UsbCcid {
    constructor(e) {
        this._fileName = "NFCPort400.js", this.communicator = e, this.slotNumber = 0, this.currentbSeq = -1, this._lock = !1, this.timerId = null, this.timerIsRunning = !1
    }
    async lock() {
        for (; this._lock;) e("escape is processing."), await wait_async(100);
        this._lock = !0
    }
    unlock() {
        this._lock = !1
    }
    startAwakeTimer() {
        null != this.timerId && this.stopAwakeTimer();
        this.timerId = setTimeout(this.awake, 2e3, this), this.timerIsRunning = !0
    }
    stopAwakeTimer() {
        null != this.timerId && (this.timerIsRunning = !1, clearTimeout(this.timerId), this.timerId = null)
    }
    async awake(r) {
        try {
            if (null != r) {
                const e = new Uint8Array([255, 86, 0, 0, 0]);
                await r.escape(e, 100)
            } else e("can't find ccid object")
        } catch (r) {
            e(r.message)
        }
        null != r ? r.timerIsRunning && r.startAwakeTimer() : e("can't find ccid object")
    }
    async escape(e, r, t) {
        let i;
        await this.lock();
        try {
            i = await this.escape_internal(e, r, t)
        } catch (e) {
            i = Promise.reject(e)
        }
        return this.unlock(), i
    }
    async escape_internal(r, t, i) {
        e("escape : start");
        let a = new Date,
            o = {},
            s = NFCPort400.SLOT_BUSY_RETRY_COUNT + 1;
        for (null != i && (s = i + 1); s > 0;) {
            const i = this.getSequenceNumber(),
                n = this.add_PC_to_RDR_Escape(r, i);
            try {
                await this.communicator.transmit(n)
            } catch (r) {
                return e("escape send error catch"), Promise.reject(r)
            }
            await this.communicator.clear();
            try {
                let r = NFCPort400.SEQUENCE_ERROR_RETRY_COUNT + 1;
                for (; r > 0;) {
                    const n = 10,
                        _ = await this.communicator.receive(n, t),
                        c = this.check_RDR_to_PC_Escape(_, i),
                        E = c.dwLength;
                    if (i == c.bSeq) r = 0;
                    else if (0 == --r) {
                        const r = "escape receive error no correct header";
                        throw e(r), new NFCPortError(NFCPortError.INVALID_RESPONSE, r, this._fileName, 1870)
                    }
                    let N = (new Date).getTime() - a.getTime();
                    if (N > t) {
                        const r = "escape receive Timeout";
                        throw e(r), new NFCPortError(NFCPortError.DATA_RECEIVE_TIMEOUT, r, this._fileName, 1881)
                    }
                    t -= N, E > 0 && (o = await this.communicator.receive(E, t));
                    const l = 1;
                    if (c.bmCommandStatus == l) {
                        const r = 224;
                        if (c.bError != r) {
                            const r = "bmCommandStatus failed. bError:" + c.bError;
                            throw e(r), new NFCPortError(NFCPortError.INVALID_RESPONSE, r, this._fileName, 1907)
                        }
                        if (0 == --s) {
                            const r = "bmCommandStatus failed. Slot Busy";
                            throw e(r), new NFCPortError(NFCPortError.COMMAND_SLOT_BUSY, r, this._fileName, 1899)
                        } {
                            const e = Math.floor(40 * Math.random()) - 20;
                            await wait_async(NFCPort400.SLOT_BUSY_WAIT_TIME + e)
                        }
                    } else {
                        if (E < 2) {
                            const r = "escape receive error no enough abData";
                            throw e(r), new NFCPortError(NFCPortError.INVALID_RESPONSE, r, this._fileName, 1912)
                        }
                        s = 0
                    }
                }
            } catch (r) {
                return e("escape receive error catch"), await this.communicator.clear(), Promise.reject(r)
            }
        }
        return e("escape : end"), o
    }
    getSequenceNumber() {
        return this.currentbSeq++, this.currentbSeq > 255 && (this.currentbSeq = 0), this.currentbSeq
    }
    add_PC_to_RDR_Escape(e, r) {
        const t = e.length;
        let i = new Uint8Array(10 + t);
        return i[0] = 107, i[1] = 255 & t, i[2] = t >> 8 & 255, i[3] = t >> 16 & 255, i[4] = t >> 24 & 255, i[5] = this.slotNumber, i[6] = r, 0 != t && i.set(e, 10), i
    }
    check_RDR_to_PC_Escape(r, t) {
        if (r.length < 10) {
            throw e("size failed."), new NFCPortError(NFCPortError.INVALID_RESPONSE, r, this._fileName, 1964)
        }
        const i = r[0],
            a = this.arrayToDoubleWord(r.slice(1, 5)),
            o = r[5],
            s = r[6],
            n = r[7],
            _ = r[8];
        if (131 != i) {
            const r = "bMessageType failed.";
            throw e(r), new NFCPortError(NFCPortError.INVALID_RESPONSE, r, this._fileName, 1981)
        }
        if (o != this.slotNumber) {
            const r = "bSlotNumber failed.";
            throw e(r), new NFCPortError(NFCPortError.INVALID_RESPONSE, r, this._fileName, 1988)
        }
        if (s != t) {
            e("bSeq failed.")
        }
        return {
            dwLength: a,
            bSeq: s,
            bmCommandStatus: this.getSlotStatusRegister(n).bmCommandStatus,
            bError: _
        }
    }
    arrayToDoubleWord(e) {
        return e[3] << 24 | e[2] << 16 | e[1] << 8 | e[0]
    }
    getSlotStatusRegister(r) {
        const t = 3 & r,
            i = r >> 6 & 3;
        switch (i) {
            case 0:
                e("Slot Status: Processed without error");
                break;
            case 1:
                e("Slot Status: Failed");
                break;
            case 2:
                e("Slot Status: Time Extension is requested")
        }
        switch (t) {
            case 0:
                e("Slot Status: An ICC is present and active");
                break;
            case 1:
                e("Slot Status: An ICC is present and inactive");
                break;
            case 2:
                e("Slot Status: No ICC is present")
        }
        return {
            bmICCStatus: t,
            bmCommandStatus: i
        }
    }
}
class ReaderWriterFactory {
    static async create(r, t) {
        e("create begin");
        let i = [],
            a = [];
        ReaderWriterFactory.setProductIds(NFCPort400.DEVICE_INFO_LIST, t, i, a), ReaderWriterFactory.setProductIds(NFCPort100.DEVICE_INFO_LIST, t, i, a);
        let o = new GenericUSB;
        await o.open(r, 1356, i, a);
        const s = o.productId;
        let n = null;
        if (NFCPort400.hasProductId(s)) n = new NFCPort400(o);
        else {
            if (!NFCPort100.hasProductId(s)) {
                const r = "Product ID not found";
                return e(r), Promise.reject(new NFCPortError(NFCPortError.DEVICE_OPEN_ERROR, r, "ReaderWriterFactory.js", 43))
            }
            n = new NFCPort100(o)
        }
        return e("create end"), n
    }
    static setProductIds(e, r, t, i) {
        e.forEach(e => {
            const a = e.productId;
            t.push(a), e.deviceType == r && i.push(a)
        })
    }
}
class Configuration {
    static get DEVICE_PRIORITY_EXTERNAL() {
        return "External"
    }
    static get DEVICE_PRIORITY_INTERNAL() {
        return "Internal"
    }
    constructor(e, r, t, i, a, o) {
        this.ackTimeout = e, this.receiveTimeout = r, this.autoBaudRate = t, this.autoDeviceSelect = i, this.devicePriority = a, this.priorityLibrary = o
    }
}
class CommunicationOption {
    constructor(e, r, t, i, a, o, s, n, _, c) {
        this.mifareAuthentication = e, this.key = r, this.keyType = t, this.blockNumber = i, this.uid = a, this.appendCrc = o, this.discardCrc = s, this.insertParity = n, this.expectParity = _, this.txNumberOfValidBits = c
    }
}
const a = Configuration.DEVICE_PRIORITY_EXTERNAL;
var o = !1;
class NFCPortLib {
    constructor() {
        this._fileName = "NFCPortLib.js", this.deviceName = null, this.targetCardBaudRate = null, this.serialNumber = null, this.deviceType = null, this.modelName = null, this.firmwareVersion = null, this.libraryVersion = "1.1", this._rw = null, this._config = null, this._status = "S0"
    }
    async init(r) {
        let t;
        if (e("init begin"), o) return t = "A call occurred during a library call.", e(t), Promise.reject(new NFCPortError(NFCPortError.API_CALL_IN_PROGRESS, t, this._fileName, 121));
        o = !0;
        try {
            await this.init_internal(r)
        } catch (e) {
            return o = !1, Promise.reject(e)
        }
        o = !1, e("init end")
    }
    async open() {
        let r;
        if (e("open begin"), o) return r = "A call occurred during a library call.", e(r), Promise.reject(new NFCPortError(NFCPortError.API_CALL_IN_PROGRESS, r, this._fileName, 175));
        o = !0;
        try {
            await this.open_internal()
        } catch (e) {
            return o = !1, Promise.reject(e)
        }
        o = !1, e("open end")
    }
    async detectCard(r, t) {
        let i, a;
        if (e("detectCard begin"), o) return i = "A call occurred during a library call.", e(i), Promise.reject(new NFCPortError(NFCPortError.API_CALL_IN_PROGRESS, i, this._fileName, 242));
        o = !0;
        try {
            a = await this.detectCard_internal(r, t)
        } catch (e) {
            return o = !1, Promise.reject(e)
        }
        return o = !1, e("detectCard end"), a
    }
    async communicateThru(r, t, i) {
        let a, s;
        if (e("communicateThru begin"), o) return s = "A call occurred during a library call.", e(s), Promise.reject(new NFCPortError(NFCPortError.API_CALL_IN_PROGRESS, s, this._fileName, 307));
        o = !0;
        try {
            a = await this.communicateThru_internal(r, t, i)
        } catch (e) {
            return o = !1, Promise.reject(e)
        }
        return o = !1, e("communicateThru end"), a
    }
    async switchRF(r) {
        let t;
        if (e("switchRF begin"), o) return t = "A call occurred during a library call.", e(t), Promise.reject(new NFCPortError(NFCPortError.API_CALL_IN_PROGRESS, t, this._fileName, 366));
        o = !0;
        try {
            await this.switchRF_internal(r)
        } catch (e) {
            return o = !1, Promise.reject(e)
        }
        o = !1, e("switchRF end")
    }
    async close() {
        let r;
        if (e("close begin"), o) return r = "A call occurred during a library call.", e(r), Promise.reject(new NFCPortError(NFCPortError.API_CALL_IN_PROGRESS, r, this._fileName, 409));
        o = !0;
        try {
            await this.close_internal()
        } catch (e) {
            return o = !1, Promise.reject(e)
        }
        o = !1, e("close end")
    }
    async diagnose(r, t, i) {
        let a, s;
        if (e("diagnose begin"), o) return s = "A call occurred during a library call.", e(s), Promise.reject(new NFCPortError(NFCPortError.API_CALL_IN_PROGRESS, s, this._fileName, 438));
        o = !0;
        try {
            a = await this.diagnose_internal(r, t, i)
        } catch (e) {
            return o = !1, Promise.reject(e)
        }
        return o = !1, e("diagnose end"), a
    }
    async prepareUpdateFirmware(r) {
        let t, i;
        if (e("prepareUpdateFirmware begin"), o) return i = "A call occurred during a library call.", e(i), Promise.reject(new NFCPortError(NFCPortError.API_CALL_IN_PROGRESS, i, this._fileName, 467));
        o = !0;
        try {
            t = await this.prepareUpdateFirmware_internal(r)
        } catch (e) {
            return o = !1, Promise.reject(e)
        }
        return o = !1, e("prepareUpdateFirmware end"), t
    }
    async updateFirmware(r, t) {
        let i, a;
        if (e("updateFirmware begin"), o) return a = "A call occurred during a library call.", e(a), Promise.reject(new NFCPortError(NFCPortError.API_CALL_IN_PROGRESS, a, this._fileName, 496));
        o = !0;
        try {
            i = await this.updateFirmware_internal(r, t)
        } catch (e) {
            return o = !1, Promise.reject(e)
        }
        return o = !1, e("updateFirmware end"), i
    }
    async resetDevice(r) {
        let t;
        if (e("resetDevice begin"), o) return t = "A call occurred during a library call.", e(t), Promise.reject(new NFCPortError(NFCPortError.API_CALL_IN_PROGRESS, t, this._fileName, 525));
        o = !0;
        try {
            await this.resetDevice_internal(r)
        } catch (e) {
            return o = !1, Promise.reject(e)
        }
        o = !1, e("resetDevice end")
    }
    async getFirmwareVersion() {
        let r, t;
        if (e("getFirmwareVersion begin"), o) return t = "A call occurred during a library call.", e(t), Promise.reject(new NFCPortError(NFCPortError.API_CALL_IN_PROGRESS, t, this._fileName, 554));
        o = !0;
        try {
            r = await this.getFirmwareVersion_internal()
        } catch (e) {
            return o = !1, Promise.reject(e)
        }
        return o = !1, e("getFirmwareVersion end"), r
    }
    async getModelID() {
        let r, t;
        if (e("getModelID begin"), o) return t = "A call occurred during a library call.", e(t), Promise.reject(new NFCPortError(NFCPortError.API_CALL_IN_PROGRESS, t, this._fileName, 583));
        o = !0;
        try {
            r = await this.getModelID_internal()
        } catch (e) {
            return o = !1, Promise.reject(e)
        }
        return o = !1, e("getModelID end"), r
    }
    async startRFFEParameterMode() {
        let r, t;
        if (e("startRFFEParameterMode begin"), o) return t = "A call occurred during a library call.", e(t), Promise.reject(new NFCPortError(NFCPortError.API_CALL_IN_PROGRESS, t, this._fileName, 612));
        o = !0;
        try {
            r = await this.startRFFEParameterMode_internal()
        } catch (e) {
            return o = !1, Promise.reject(e)
        }
        return o = !1, e("startRFFEParameterMode end"), r
    }
    async endRFFEParameterMode() {
        let r, t;
        if (e("endRFFEParameterMode begin"), o) return t = "A call occurred during a library call.", e(t), Promise.reject(new NFCPortError(NFCPortError.API_CALL_IN_PROGRESS, t, this._fileName, 641));
        o = !0;
        try {
            r = await this.endRFFEParameterMode_internal()
        } catch (e) {
            return o = !1, Promise.reject(e)
        }
        return o = !1, e("endRFFEParameterMode end"), r
    }
    async readRFFEParameter(r, t, i) {
        let a, s;
        if (e("readRFFEParameter begin"), o) return s = "A call occurred during a library call.", e(s), Promise.reject(new NFCPortError(NFCPortError.API_CALL_IN_PROGRESS, s, this._fileName, 670));
        o = !0;
        try {
            a = await this.readRFFEParameter_internal(r, t, i)
        } catch (e) {
            return o = !1, Promise.reject(e)
        }
        return o = !1, e("readRFFEParameter end"), a
    }
    async writeRFFEParameter(r, t, i) {
        let a, s;
        if (e("writeRFFEParameter begin"), o) return s = "A call occurred during a library call.", e(s), Promise.reject(new NFCPortError(NFCPortError.API_CALL_IN_PROGRESS, s, this._fileName, 699));
        o = !0;
        try {
            a = await this.writeRFFEParameter_internal(r, t, i)
        } catch (e) {
            return o = !1, Promise.reject(e)
        }
        return o = !1, e("writeRFFEParameter end"), a
    }
    async init_internal(r) {
        let t;
        if (e("init_internal begin"), null != r) {
            if ("object" != typeof r) return t = "The config is incorrect type.", e(t), Promise.reject(new NFCPortError(NFCPortError.INVALID_PARAMETER, t, this._fileName, 731));
            if (null != r.ackTimeout && "number" != typeof r.ackTimeout) return t = "config.ackTimeout is incorrect type", e(t), Promise.reject(new NFCPortError(NFCPortError.INVALID_PARAMETER, t, this._fileName, 735));
            if (null != r.ackTimeout && (r.ackTimeout < 0 || r.ackTimeout > 6553)) return t = "config.ackTimeout is out of range", e(t), Promise.reject(new NFCPortError(NFCPortError.INVALID_PARAMETER, t, this._fileName, 740));
            if (null != r.receiveTimeout && "number" != typeof r.receiveTimeout) return t = "config.receiveTimeout is incorrect type", e(t), Promise.reject(new NFCPortError(NFCPortError.INVALID_PARAMETER, t, this._fileName, 744));
            if (null != r.receiveTimeout && (r.receiveTimeout < 0 || r.receiveTimeout > 6553)) return t = "config.receiveTimeout is out of range", e(t), Promise.reject(new NFCPortError(NFCPortError.INVALID_PARAMETER, t, this._fileName, 749));
            if (null != r.autoBaudRate && "boolean" != typeof r.autoBaudRate) return t = "config.autoBaudRate is incorrect type", e(t), Promise.reject(new NFCPortError(NFCPortError.INVALID_PARAMETER, t, this._fileName, 753));
            if (null != r.autoDeviceSelect && "boolean" != typeof r.autoDeviceSelect) return t = "config.autoDeviceSelect is incorrect type", e(t), Promise.reject(new NFCPortError(NFCPortError.INVALID_PARAMETER, t, this._fileName, 757));
            if (null != r.devicePriority && 0 == [Configuration.DEVICE_PRIORITY_EXTERNAL, Configuration.DEVICE_PRIORITY_INTERNAL].includes(r.devicePriority)) return t = "config.devicePriority is incorrect type", e(t), Promise.reject(new NFCPortError(NFCPortError.INVALID_PARAMETER, t, this._fileName, 761));
            if (null != r.priorityLibrary && "boolean" != typeof r.priorityLibrary) return t = "config.priorityLibrary is incorrect type", e(t), Promise.reject(new NFCPortError(NFCPortError.INVALID_PARAMETER, t, this._fileName, 765))
        }
        if (null == r ? r = new Configuration(1e3, 1500, false, true, a, true) : (null != r.ackTimeout ? r.ackTimeout < 400 && (r.ackTimeout = 400) : r.ackTimeout = 1e3, null != r.receiveTimeout ? r.receiveTimeout < 400 && (r.receiveTimeout = 400) : r.receiveTimeout = 1500, null == r.autoBaudRate && (r.autoBaudRate = false), null == r.autoDeviceSelect && (r.autoDeviceSelect = true), null == r.devicePriority && (r.devicePriority = a), null == r.priorityLibrary && (r.priorityLibrary = true)), null != this._rw) try {
            await this._rw.close()
        } catch (e) {}
        this._rw = null, this.deviceName = null, this.targetCardBaudRate = null, this.serialNumber = null, this.deviceType = null, this.modelName = null, this.firmwareVersion = null, this._config = r, this._status = "S1", e("init_internal end")
    }
    async open_internal() {
        let r, t;
        if (e("open_internal begin"), "S1" != this._status && "S3" != this._status) return t = "Can not callout Library Status (Status=" + this._status + ")", e(t), Promise.reject(new NFCPortError(NFCPortError.CANTCALLOUT_LIBRARY_STATUS, t, this._fileName, 879));
        try {
            r = await ReaderWriterFactory.create(this._config.autoDeviceSelect, this._config.devicePriority), await r.init(this._config), await r.open()
        } catch (e) {
            return Promise.reject(e)
        }
        this.deviceName = r.deviceName, this.serialNumber = r.serialNumber, this.deviceType = r.deviceType, this.modelName = r.modelName, this.firmwareVersion = r.firmwareVersion, this._rw = r, this._rw.isUpdateMode ? this._status = "S5" : this._status = "S2", e("open_internal end")
    }
    async detectCard_internal(r, t) {
        let i, a;
        if (e("detectCard_internal begin"), null == r) return i = "The protocol is not specified.", e(i), Promise.reject(new NFCPortError(NFCPortError.INVALID_PARAMETER, i, this._fileName, 896));
        if ("string" != typeof r) return i = "The protocol is incorrect type.", e(i), Promise.reject(new NFCPortError(NFCPortError.INVALID_PARAMETER, i, this._fileName, 900));
        if (null != t) {
            if ("object" != typeof t) return i = "The option is incorrect type.", e(i), Promise.reject(new NFCPortError(NFCPortError.INVALID_PARAMETER, i, this._fileName, 905));
            if (null != t.systemCode && ("object" != typeof t.systemCode || "Uint8Array" != t.systemCode.constructor.name || 0 != t.systemCode.length && 2 != t.systemCode.length)) return i = "The option.systemCode is incorrect type.", e(i), Promise.reject(new NFCPortError(NFCPortError.INVALID_PARAMETER, i, this._fileName, 912));
            if (null != t.timeSlot && "number" != typeof t.timeSlot) return i = "The option.timeSlot is incorrect type.", e(i), Promise.reject(new NFCPortError(NFCPortError.INVALID_PARAMETER, i, this._fileName, 916));
            if (null != t.requestSystemCode && "boolean" != typeof t.requestSystemCode) return i = "The option.requestSystemCode is incorrect type.", e(i), Promise.reject(new NFCPortError(NFCPortError.INVALID_PARAMETER, i, this._fileName, 920));
            if (null != t.requestBaudRate && "boolean" != typeof t.requestBaudRate) return i = "The option.requestBaudRate is incorrect type.", e(i), Promise.reject(new NFCPortError(NFCPortError.INVALID_PARAMETER, i, this._fileName, 924));
            if (null != t.fsdi && "number" != typeof t.fsdi) return i = "The option.fsdi is incorrect type.", e(i), Promise.reject(new NFCPortError(NFCPortError.INVALID_PARAMETER, i, this._fileName, 928));
            if (null != t.cid && "number" != typeof t.cid) return i = "The option.cid is incorrect type.", e(i), Promise.reject(new NFCPortError(NFCPortError.INVALID_PARAMETER, i, this._fileName, 932))
        }
        if (null == t ? t = new DetectionOption : (null == t.systemCode && (t.systemCode = DetectionOption.SYSCODE_DEFAULT), null == t.timeSlot && (t.timeSlot = DetectionOption.TIMESLOT_DEFAULT), null == t.requestSystemCode && (t.requestSystemCode = DetectionOption.REQUEST_SYSCODE_DEFAULT), null == t.requestBaudRate && (t.requestBaudRate = DetectionOption.REQUEST_BAUDRATE_DEFAULT)), "S2" != this._status) return i = "Can not callout Library Status (Status=" + this._status + ")", e(i), Promise.reject(new NFCPortError(NFCPortError.CANTCALLOUT_LIBRARY_STATUS, i, this._fileName, 980));
        try {
            a = await this._rw.detectCard(r, t)
        } catch (e) {
            return this._rw.bAbnormalState && (this._status = "S4"), Promise.reject(e)
        }
        return this.targetCardBaudRate = this._rw.targetCardBaudRate, e("detectCard_internal end"), a
    }
    async communicateThru_internal(r, t, i) {
        let a, o;
        if (e("communicateThru_internal begin"), null != r) {
            if ("object" != typeof r || "Uint8Array" != r.constructor.name) return o = "The command is incorrect type.", e(o), Promise.reject(new NFCPortError(NFCPortError.INVALID_PARAMETER, o, this._fileName, 998));
            if (null == t) return o = "The timeout is not specified.", e(o), Promise.reject(new NFCPortError(NFCPortError.INVALID_PARAMETER, o, this._fileName, 1002));
            if ("number" != typeof t) return o = "The timeout is incorrect type.", e(o), Promise.reject(new NFCPortError(NFCPortError.INVALID_PARAMETER, o, this._fileName, 1006));
            if (t < 0 || t > 6553) return o = "The timeout is out of range", e(o), Promise.reject(new NFCPortError(NFCPortError.INVALID_PARAMETER, o, this._fileName, 1010));
            t < 400 && (t = 400)
        } else if (null == i) return o = "The command is not specified", e(o), Promise.reject(new NFCPortError(NFCPortError.INVALID_PARAMETER, o, this._fileName, 1022));
        if (null != i) {
            if ("object" != typeof i) return o = "The option is incorrect type.", e(o), Promise.reject(new NFCPortError(NFCPortError.INVALID_PARAMETER, o, this._fileName, 1031));
            if (null != i.mifareAuthentication && "boolean" != typeof i.mifareAuthentication) return o = "The option.mifareAuthentication is incorrect type.", e(o), Promise.reject(new NFCPortError(NFCPortError.INVALID_PARAMETER, o, this._fileName, 1035));
            if (null != i.key && ("object" != typeof i.key || "Uint8Array" != i.key.constructor.name)) return o = "The option.key is incorrect type.", e(o), Promise.reject(new NFCPortError(NFCPortError.INVALID_PARAMETER, o, this._fileName, 1039));
            if (null != i.keyType && "string" != typeof i.keyType) return o = "The option.keyType is incorrect type.", e(o), Promise.reject(new NFCPortError(NFCPortError.INVALID_PARAMETER, o, this._fileName, 1043));
            if (null != i.blockNumber && "number" != typeof i.blockNumber) return o = "The option.blockNumber is incorrect type.", e(o), Promise.reject(new NFCPortError(NFCPortError.INVALID_PARAMETER, o, this._fileName, 1047));
            if (null != i.uid && ("object" != typeof i.uid || "Uint8Array" != i.uid.constructor.name)) return o = "The option.uid is incorrect type.", e(o), Promise.reject(new NFCPortError(NFCPortError.INVALID_PARAMETER, o, this._fileName, 1051));
            if (null != i.appendCrc && "boolean" != typeof i.appendCrc) return o = "The option.appendCrc is incorrect type.", e(o), Promise.reject(new NFCPortError(NFCPortError.INVALID_PARAMETER, o, this._fileName, 1055));
            if (null != i.discardCrc && "boolean" != typeof i.discardCrc) return o = "The option.discardCrc is incorrect type.", e(o), Promise.reject(new NFCPortError(NFCPortError.INVALID_PARAMETER, o, this._fileName, 1059));
            if (null != i.insertParity && "boolean" != typeof i.insertParity) return o = "The option.insertParity is incorrect type.", e(o), Promise.reject(new NFCPortError(NFCPortError.INVALID_PARAMETER, o, this._fileName, 1063));
            if (null != i.expectParity && "boolean" != typeof i.expectParity) return o = "The option.expectParity is incorrect type.", e(o), Promise.reject(new NFCPortError(NFCPortError.INVALID_PARAMETER, o, this._fileName, 1067));
            if (null != i.txNumberOfValidBits && "number" != typeof i.txNumberOfValidBits) return o = "The option.txNumberOfValidBits is incorrect type.", e(o), Promise.reject(new NFCPortError(NFCPortError.INVALID_PARAMETER, o, this._fileName, 1071))
        }
        if ("S2" != this._status) return o = "Can not callout Library Status (Status=" + this._status + ")", e(o), Promise.reject(new NFCPortError(NFCPortError.CANTCALLOUT_LIBRARY_STATUS, o, this._fileName, 1091));
        try {
            a = await this._rw.communicateThru(r, t, i)
        } catch (e) {
            return this._rw.bAbnormalState && (this._status = "S4"), Promise.reject(e)
        }
        return e("communicateThru_internal end"), a
    }
    async switchRF_internal(r) {
        let t;
        if (e("switchRF_internal begin"), null == r) return t = "Parameter is not specified.", e(t), Promise.reject(new NFCPortError(NFCPortError.INVALID_PARAMETER, t, this._fileName, 1107));
        if ("boolean" != typeof r) return t = "Parameter is incorrect type.", e(t), Promise.reject(new NFCPortError(NFCPortError.INVALID_PARAMETER, t, this._fileName, 1111));
        if ("S2" != this._status) return t = "Can not callout Library Status (Status=" + this._status + ")", e(t), Promise.reject(new NFCPortError(NFCPortError.CANTCALLOUT_LIBRARY_STATUS, t, this._fileName, 1131));
        try {
            await this._rw.switchRF(r)
        } catch (e) {
            return this._rw.bAbnormalState && (this._status = "S4"), Promise.reject(e)
        }
        e("switchRF_internal end")
    }
    async close_internal() {
        let r;
        if (e("close_internal begin"), "S2" == this._status || "S4" == this._status || "S5" == this._status || "S6" == this._status) {
            if (null != this._rw) {
                try {
                    await this._rw.close()
                } catch (r) {
                    e(r.message)
                }
                this._rw = null
            }
            this._status = "S3"
        } else r = "Do nothing Library Status (Status=" + this._status + ")", e(r);
        e("close_internal end")
    }
    async diagnose_internal(r, t, i) {
        let a, o;
        if (e("diagnose_internal begin"), null == r) return o = "Parameter is not specified.", e(o), Promise.reject(new NFCPortError(NFCPortError.INVALID_PARAMETER, o, this._fileName, 1178));
        if ("string" != typeof r) return o = "Parameter is incorrect type.", e(o), Promise.reject(new NFCPortError(NFCPortError.INVALID_PARAMETER, o, this._fileName, 1182));
        if ("S2" != this._status) return o = "Can not callout Library Status (Status=" + this._status + ")", e(o), Promise.reject(new NFCPortError(NFCPortError.CANTCALLOUT_LIBRARY_STATUS, o, this._fileName, 1201));
        try {
            a = await this._rw.diagnose(r, t, i)
        } catch (e) {
            return this._rw.bAbnormalState && (this._status = "S4"), Promise.reject(e)
        }
        return e("diagnose_internal end"), a
    }
    async prepareUpdateFirmware_internal(r) {
        let t, i;
        if (e("prepareUpdateFirmware_internal begin"), null == r) return i = "Parameter is not specified.", e(i), Promise.reject(new NFCPortError(NFCPortError.INVALID_PARAMETER, i, this._fileName, 1218));
        if (null != r && ("object" != typeof r || "Uint8Array" != r.constructor.name)) return i = "Parameter is incorrect type.", e(i), Promise.reject(new NFCPortError(NFCPortError.INVALID_PARAMETER, i, this._fileName, 1222));
        if (256 != r.length) return i = "Parameter is incorrect size.", e(i), Promise.reject(new NFCPortError(NFCPortError.INVALID_PARAMETER, i, this._fileName, 1226));
        if ("S2" != this._status) return i = "Can not callout Library Status (Status=" + this._status + ")", e(i), Promise.reject(new NFCPortError(NFCPortError.CANTCALLOUT_LIBRARY_STATUS, i, this._fileName, 1245));
        try {
            t = await this._rw.prepareUpdateFirmware(r)
        } catch (e) {
            return this._rw.bAbnormalState && (this._status = "S4"), Promise.reject(e)
        }
        return e("prepareUpdateFirmware_internal end"), t
    }
    async updateFirmware_internal(r, t) {
        let i, a;
        if (e("updateFirmware_internal begin"), null == r) return a = "The packageNo is not specified.", e(a), Promise.reject(new NFCPortError(NFCPortError.INVALID_PARAMETER, a, this._fileName, 1262));
        if (null != r && "number" != typeof r) return a = "The packageNo is incorrect type.", e(a), Promise.reject(new NFCPortError(NFCPortError.INVALID_PARAMETER, a, this._fileName, 1266));
        if (r > 65535) return a = "The packageNo is out of range", e(a), Promise.reject(new NFCPortError(NFCPortError.INVALID_PARAMETER, a, this._fileName, 1270));
        if (null == t) return a = "The firmwarePackage is not specified.", e(a), Promise.reject(new NFCPortError(NFCPortError.INVALID_PARAMETER, a, this._fileName, 1278));
        if (null != t && ("object" != typeof t || "Uint8Array" != t.constructor.name)) return a = "The firmwarePackage is incorrect type.", e(a), Promise.reject(new NFCPortError(NFCPortError.INVALID_PARAMETER, a, this._fileName, 1282));
        if (256 != t.length) return a = "The firmwarePackage is incorrect size.", e(a), Promise.reject(new NFCPortError(NFCPortError.INVALID_PARAMETER, a, this._fileName, 1286));
        if ("S5" != this._status) return a = "Can not callout Library Status (Status=" + this._status + ")", e(a), Promise.reject(new NFCPortError(NFCPortError.CANTCALLOUT_LIBRARY_STATUS, a, this._fileName, 1305));
        try {
            i = await this._rw.updateFirmware(r, t)
        } catch (e) {
            return this._rw.bAbnormalState && (this._status = "S4"), Promise.reject(e)
        }
        return e("updateFirmware_internal end"), i
    }
    async resetDevice_internal(r) {
        let t;
        if (e("resetDevice_internal begin"), null == r) r = 0;
        else {
            if (null != r && "number" != typeof r) return t = "The waitingTime is incorrect type.", e(t), Promise.reject(new NFCPortError(NFCPortError.INVALID_PARAMETER, t, this._fileName, 1323));
            if (r < 0 || 65535 < r) return t = "The waitingTime is out of range", e(t), Promise.reject(new NFCPortError(NFCPortError.INVALID_PARAMETER, t, this._fileName, 1327))
        }
        if ("S2" != this._status && "S4" != this._status && "S5" != this._status) return t = "Can not callout Library Status (Status=" + this._status + ")", e(t), Promise.reject(new NFCPortError(NFCPortError.CANTCALLOUT_LIBRARY_STATUS, t, this._fileName, 1346));
        try {
            await this._rw.resetDevice(r)
        } catch (e) {
            return this._rw.bAbnormalState && (this._status = "S4"), Promise.reject(e)
        }
        e("resetDevice_internal end")
    }
    async getFirmwareVersion_internal() {
        let r, t;
        if (e("getFirmwareVersion_internal begin"), "S2" != this._status && "S5" != this._status) return t = "Can not callout Library Status (Status=" + this._status + ")", e(t), Promise.reject(new NFCPortError(NFCPortError.CANTCALLOUT_LIBRARY_STATUS, t, this._fileName, 1373));
        try {
            r = await this._rw.getFirmwareVersion()
        } catch (e) {
            return this._rw.bAbnormalState && (this._status = "S4"), Promise.reject(e)
        }
        return e("getFirmwareVersion_internal end"), r
    }
    async getModelID_internal() {
        let r, t;
        if (e("getModelID_internal begin"), "S2" != this._status) return t = "Can not callout Library Status (Status=" + this._status + ")", e(t), Promise.reject(new NFCPortError(NFCPortError.CANTCALLOUT_LIBRARY_STATUS, t, this._fileName, 1400));
        try {
            r = await this._rw.getModelID()
        } catch (e) {
            return this._rw.bAbnormalState && (this._status = "S4"), Promise.reject(e)
        }
        return e("getModelID_internal end"), r
    }
    async startRFFEParameterMode_internal() {
        let r, t;
        if (e("startRFFEParameterMode_internal begin"), "S2" != this._status) return t = "Can not callout Library Status (Status=" + this._status + ")", e(t), Promise.reject(new NFCPortError(NFCPortError.CANTCALLOUT_LIBRARY_STATUS, t, this._fileName, 1428));
        try {
            r = await this._rw.startRFFEParameterMode(), this._status = "S6"
        } catch (e) {
            return this._rw.bAbnormalState && (this._status = "S4"), Promise.reject(e)
        }
        return e("startRFFEParameterMode_internal end"), r
    }
    async endRFFEParameterMode_internal() {
        let r, t;
        if (e("endRFFEParameterMode_internal begin"), "S6" != this._status) return t = "Can not callout Library Status (Status=" + this._status + ")", e(t), Promise.reject(new NFCPortError(NFCPortError.CANTCALLOUT_LIBRARY_STATUS, t, this._fileName, 1456));
        try {
            r = await this._rw.endRFFEParameterMode(), this._status = "S2"
        } catch (e) {
            return this._rw.bAbnormalState && (this._status = "S4"), Promise.reject(e)
        }
        return e("endRFFEParameterMode_internal end"), r
    }
    async readRFFEParameter_internal(r, t, i) {
        let a, o;
        if (e("readRFFEParameter_internal begin"), null == r) return o = "Parameter is not specified.", e(o), Promise.reject(new NFCPortError(NFCPortError.INVALID_PARAMETER, o, this._fileName, 1473));
        if (null != r && "number" != typeof r) return o = "Parameter is incorrect type.", e(o), Promise.reject(new NFCPortError(NFCPortError.INVALID_PARAMETER, o, this._fileName, 1477));
        if (null == t) return o = "Parameter is not specified.", e(o), Promise.reject(new NFCPortError(NFCPortError.INVALID_PARAMETER, o, this._fileName, 1485));
        if (null != t && "number" != typeof t) return o = "Parameter is incorrect type.", e(o), Promise.reject(new NFCPortError(NFCPortError.INVALID_PARAMETER, o, this._fileName, 1489));
        if (null == i);
        else if (null != i && ("object" != typeof i || "Uint8Array" != i.constructor.name)) return o = "The dataIn is incorrect type.", e(o), Promise.reject(new NFCPortError(NFCPortError.INVALID_PARAMETER, o, this._fileName, 1499));
        if ("S6" != this._status) return o = "Can not callout Library Status (Status=" + this._status + ")", e(o), Promise.reject(new NFCPortError(NFCPortError.CANTCALLOUT_LIBRARY_STATUS, o, this._fileName, 1518));
        try {
            a = await this._rw.readRFFEParameter(r, t, i)
        } catch (e) {
            return this._rw.bAbnormalState && (this._status = "S4"), Promise.reject(e)
        }
        return e("readRFFEParameter_internal end"), a
    }
    async writeRFFEParameter_internal(r, t, i) {
        let a, o;
        if (e("writeRFFEParameter_internal begin"), null == r) return o = "Parameter is not specified.", e(o), Promise.reject(new NFCPortError(NFCPortError.INVALID_PARAMETER, o, this._fileName, 1535));
        if (null != r && "number" != typeof r) return o = "Parameter is incorrect type.", e(o), Promise.reject(new NFCPortError(NFCPortError.INVALID_PARAMETER, o, this._fileName, 1539));
        if (null == t) return o = "Parameter is not specified.", e(o), Promise.reject(new NFCPortError(NFCPortError.INVALID_PARAMETER, o, this._fileName, 1547));
        if (null != t && "number" != typeof t) return o = "Parameter is incorrect type.", e(o), Promise.reject(new NFCPortError(NFCPortError.INVALID_PARAMETER, o, this._fileName, 1551));
        if (null == i);
        else if (null != i && ("object" != typeof i || "Uint8Array" != i.constructor.name)) return o = "The dataIn is incorrect type.", e(o), Promise.reject(new NFCPortError(NFCPortError.INVALID_PARAMETER, o, this._fileName, 1561));
        if ("S6" != this._status) return o = "Can not callout Library Status (Status=" + this._status + ")", e(o), Promise.reject(new NFCPortError(NFCPortError.CANTCALLOUT_LIBRARY_STATUS, o, this._fileName, 1580));
        try {
            a = await this._rw.writeRFFEParameter(r, t, i)
        } catch (e) {
            return this._rw.bAbnormalState && (this._status = "S4"), Promise.reject(e)
        }
        return e("writeRFFEParameter_internal end"), a
    }
}
export {
    CommunicationOption,
    Configuration,
    DetectionOption,
    NFCPortError,
    NFCPortLib,
    TargetCard,
    enableDebugLog
};