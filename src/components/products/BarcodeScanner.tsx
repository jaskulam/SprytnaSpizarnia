import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Camera, useCameraDevices, useFrameProcessor } from 'react-native-vision-camera';
import { scanBarcodes, BarcodeFormat } from 'vision-camera-code-scanner';
import { runOnJS } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';

const { width, height } = Dimensions.get('window');

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  onClose: () => void;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({
  onScan,
  onClose,
}) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [flashOn, setFlashOn] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const hasScannedRef = useRef(false);
  const devices = useCameraDevices();
  const device = devices.back;

  useEffect(() => {
    requestCameraPermission();
  }, []);

  const requestCameraPermission = async () => {
    try {
      // Prefer VisionCamera's permission flow where possible
      const vcStatus = await Camera.requestCameraPermission();
      if (vcStatus === 'authorized') {
        setHasPermission(true);
        return;
      }
      // Fallback to react-native-permissions if needed
      const permission = Platform.OS === 'ios' ? PERMISSIONS.IOS.CAMERA : PERMISSIONS.ANDROID.CAMERA;
      const result = await request(permission);
      setHasPermission(result === RESULTS.GRANTED);
      if (result !== RESULTS.GRANTED) {
        Alert.alert(
          'Brak dostępu do kamery',
          'Aby skanować kody kreskowe, musisz zezwolić na dostęp do kamery.',
          [
            { text: 'Anuluj', onPress: onClose },
            { text: 'Ustawienia', onPress: onClose },
          ]
        );
      }
    } catch (error) {
      console.error('Error requesting camera permission:', error);
      setHasPermission(false);
    }
  };

  const onBarCodeRead = ({ data }: { data: string }) => {
    if (isProcessing) return;
    if (hasScannedRef.current) return;
    
    setIsProcessing(true);
    hasScannedRef.current = true;
    
    // Walidacja kodu kreskowego (podstawowa)
    if (data && data.length > 6) {
      onScan(data);
    } else {
      Alert.alert(
        'Nieprawidłowy kod',
        'Nie udało się odczytać prawidłowego kodu kreskowego. Spróbuj ponownie.',
        [{ text: 'OK', onPress: () => setIsProcessing(false) }]
      );
    }
  };

  const frameProcessor = useFrameProcessor((frame) => {
    'worklet';
    // Use ZXing/MLKit via plugin
    const codes = scanBarcodes(frame, [
      BarcodeFormat.EAN_13,
      BarcodeFormat.EAN_8,
      BarcodeFormat.CODE_128,
      BarcodeFormat.CODE_39,
      BarcodeFormat.CODE_93,
      BarcodeFormat.UPC_E,
      BarcodeFormat.QR_CODE,
    ]);
    if (codes.length > 0) {
      const code: any = codes[0];
      const value = code?.displayValue ?? code?.content?.data ?? code?.rawValue;
      if (value) {
        runOnJS(onBarCodeRead)({ data: String(value) });
      }
    }
  }, []);

  const toggleFlash = () => {
    setFlashOn(!flashOn);
  };

  if (hasPermission === null || !device) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Sprawdzanie uprawnień...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionContainer}>
          <Icon name="camera-off" size={64} color="#757575" />
          <Text style={styles.permissionText}>
            Brak dostępu do kamery
          </Text>
          <Text style={styles.permissionSubtext}>
            Aby skanować kody kreskowe, zezwól na dostęp do kamery w ustawieniach aplikacji.
          </Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Zamknij</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        style={styles.camera}
        device={device}
        isActive={true}
        torch={flashOn ? 'on' : 'off'}
        frameProcessor={frameProcessor}
        frameProcessorFps={5}
      >
        {/* Overlay z ramką skanowania */}
        <View style={styles.overlay}>
          <View style={styles.topOverlay}>
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.headerButton}
                onPress={onClose}
              >
                <Icon name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Skanuj kod kreskowy</Text>
              <TouchableOpacity
                style={styles.headerButton}
                onPress={toggleFlash}
              >
                <Icon 
                  name={flashOn ? "flashlight" : "flashlight-off"} 
                  size={24} 
                  color="#FFFFFF" 
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.middleOverlay}>
            <View style={styles.leftOverlay} />
            <View style={styles.scanFrame}>
              {/* Rogi ramki skanowania */}
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
              
              {/* Animowana linia skanowania */}
              <View style={styles.scanLine} />
            </View>
            <View style={styles.rightOverlay} />
          </View>

          <View style={styles.bottomOverlay}>
            <Text style={styles.instructionText}>
              Wyśrodkuj kod kreskowy w ramce
            </Text>
            {isProcessing && (
              <View style={styles.processingContainer}>
                <ActivityIndicator size="small" color="#FFFFFF" />
                <Text style={styles.processingText}>Przetwarzanie...</Text>
              </View>
            )}
          </View>
        </View>
      </Camera>
    </View>
  );
};

const scanFrameSize = width * 0.7;
const scanFrameHeight = scanFrameSize * 0.6;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  camera: {
    flex: 1,
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  permissionText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  permissionSubtext: {
    color: '#CCCCCC',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  closeButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  overlay: {
    flex: 1,
  },
  topOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 44 : 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  middleOverlay: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leftOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    height: scanFrameHeight,
  },
  rightOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    height: scanFrameHeight,
  },
  scanFrame: {
    width: scanFrameSize,
    height: scanFrameHeight,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: '#4CAF50',
    borderWidth: 3,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  scanLine: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#4CAF50',
    opacity: 0.8,
  },
  bottomOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  instructionText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  processingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.8)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  processingText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginLeft: 8,
  },
});

export default BarcodeScanner;
