import { useState, useEffect, useCallback } from 'react';
import { NFCPortLib, Configuration, DetectionOption } from './NFCPortLib.js';
import Encoding from 'encoding-japanese';
import toast from 'react-hot-toast';

function _array_copy(dest, dest_offset, src, src_offset, length) {
    for (let idx = 0; idx < length; idx++) {
        dest[dest_offset + idx] = src[src_offset + idx];
    }
}

export const useNfcReader = (isScanning, setIsScanning) => {
    const [studentId, setStudentId] = useState('');
    const [error, setError] = useState(null);
    const [retryCounter, setRetryCounter] = useState(0);

    const reset = useCallback(() => {
        setStudentId('');
        setError(null);
        setRetryCounter(0);
        setIsScanning(false);
    }, [setIsScanning]);

    useEffect(() => {
        if (!isScanning) return;

        let isMounted = true;
        const startNfcScan = async () => {
            let lib = null;
            try {
                lib = new NFCPortLib();
                await lib.init(new Configuration(500, 500, true, true));
                await lib.open();

                const detectOption = new DetectionOption(new Uint8Array([0x82, 0x77]), 0, true, false, null);
                const card = await lib.detectCard('iso18092', detectOption);

                const readStudentIdCommand = new Uint8Array([16, 0x06, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0x0b, 0x01, 1, 0x80, 0x00]);
                _array_copy(readStudentIdCommand, 2, card.idm, 0, card.idm.length);
                const response = await lib.communicateThru(readStudentIdCommand, 100, detectOption);

                if (response.length > 13) {
                    const blockData = response.slice(13);
                    const decodedString = Encoding.convert(blockData, { to: 'UNICODE', from: 'SJIS', type: 'string' });
                    const id = decodedString.substring(3, 10);
                    if (isMounted) {
                        setStudentId(id);
                        setIsScanning(false);
                    }
                } else {
                    throw new Error('カードから有効なデータが取得できませんでした。');
                }
            } catch (err) {
                if (!isMounted) return;
                if (retryCounter >= 9) {
                    toast.error('カードを読み取れませんでした。');
                    setError('読み取りに失敗しました。');
                    reset();
                } else {
                    setTimeout(() => setRetryCounter(c => c + 1), 2000);
                }
            } finally {
                if (lib) await lib.close();
            }
        };

        startNfcScan();
        return () => { isMounted = false; };
    }, [isScanning, retryCounter, reset, setIsScanning]);

    return { studentId, error, reset };
};