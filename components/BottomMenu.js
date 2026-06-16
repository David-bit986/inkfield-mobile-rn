import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput } from 'react-native';

export default function BottomMenu({ webViewRef }) {
  const [activeSection, setActiveSection] = useState('brush');
  const [brushMode, setBrushMode] = useState(1);
  const [brushSize, setBrushSize] = useState(1);
  const [inkEffect, setInkEffect] = useState(0);
  const [pathRotation, setPathRotation] = useState(0);
  const [selectedColor, setSelectedColor] = useState('black');
  const [customColor, setCustomColor] = useState('#1A1A1A');

  const sendCommand = (command) => {
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript(command);
    }
  };

  const changeBrushMode = (mode) => {
    setBrushMode(mode);
    sendCommand(`document.getElementById('brush-mode-${mode}')?.click(); true;`);
  };

  const changeBrushSize = (size) => {
    setBrushSize(size);
    const sizeMap = { 0.1: 'xxs', 0.25: 'xs', 0.5: 's', 1: 'm', 2: 'l', 3: 'xl', 5: 'xxl', 10: 'xxxl' };
    sendCommand(`document.getElementById('brush-size-${sizeMap[size]}')?.click(); true;`);
  };

  const changeInkEffect = (effect) => {
    setInkEffect(effect);
    sendCommand(`document.getElementById('ink-effect-${effect}')?.click(); true;`);
  };

  const changePathRotation = (rotation) => {
    setPathRotation(rotation);
    sendCommand(`document.getElementById('path-rotation-${rotation}')?.click(); true;`);
  };

  const changeColor = (color) => {
    setSelectedColor(color);
    sendCommand(`document.querySelector('[data-color="${color}"]')?.click(); true;`);
  };

  const changeCustomColor = (hex) => {
    setCustomColor(hex);
    sendCommand(`
      document.getElementById('custom-brush-color').value = '${hex}';
      document.getElementById('custom-brush-color').dispatchEvent(new Event('input', { bubbles: true }));
      true;
    `);
  };

  const clearCanvas = () => {
    sendCommand(`document.getElementById('clear-canvas')?.click(); true;`);
  };

  const downloadDrawing = () => {
    sendCommand(`
      const canvas = document.querySelector('canvas');
      if (canvas) {
        const dataURL = canvas.toDataURL('image/png');
        const filename = 'inkfield-' + new Date().toISOString().slice(0,19).replace(/:/g, '-') + '.png';
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'DOWNLOAD_IMAGE',
          payload: dataURL,
          filename: filename
        }));
      }
      true;
    `);
  };

  const downloadLines = () => {
    sendCommand(`
      try {
        const canvas = document.querySelector('canvas');
        if (canvas) {
          const tempCanvas = document.createElement('canvas');
          tempCanvas.width = canvas.width;
          tempCanvas.height = canvas.height;
          const ctx = tempCanvas.getContext('2d');
          ctx.drawImage(canvas, 0, 0);
          
          const imageData = ctx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
          const data = imageData.data;
          
          const bgR = data[0], bgG = data[1], bgB = data[2];
          const tolerance = 15;
          
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i], g = data[i + 1], b = data[i + 2];
            if (Math.abs(r - bgR) < tolerance && 
                Math.abs(g - bgG) < tolerance && 
                Math.abs(b - bgB) < tolerance) {
              data[i + 3] = 0;
            }
          }
          
          ctx.putImageData(imageData, 0, 0);
          const dataURL = tempCanvas.toDataURL('image/png');
          const filename = 'inkfield-lines-' + new Date().toISOString().slice(0,19).replace(/:/g, '-') + '.png';
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'DOWNLOAD_IMAGE',
            payload: dataURL,
            filename: filename
          }));
        }
      } catch (e) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'ERROR',
          message: e.message
        }));
      }
      true;
    `);
  };

  const changeCanvasBg = (hex) => {
    setCustomColor(hex);
    sendCommand(`
      const bgInput = document.getElementById('canvas-background-color');
      if (bgInput) {
        bgInput.value = '${hex}';
        bgInput.dispatchEvent(new Event('input', { bubbles: true }));
        bgInput.dispatchEvent(new Event('change', { bubbles: true }));
      }
      true;
    `);
  };

  const colors = [
    { name: 'black', hex: '#1A1A1A' },
    { name: 'white', hex: '#F2F2F2' },
    { name: 'brown', hex: '#AF8C59' },
    { name: 'green', hex: '#3F4D18' },
    { name: 'blue', hex: '#02426D' },
    { name: 'purple', hex: '#8C6AAC' },
    { name: 'red', hex: '#D02340' },
    { name: 'orange', hex: '#FEA03E' },
    { name: 'yellow', hex: '#FFF938' },
  ];

  const   renderContent = () => {
    switch (activeSection) {
      case 'brush':
        return (
          <View style={styles.content}>
            <View style={styles.largeButtonGrid}>
              {[1, 2, 3, 4, 5, 6, 7].map(mode => (
                <TouchableOpacity
                  key={mode}
                  style={[styles.largeButton, brushMode === mode && styles.activeButton]}
                  onPress={() => changeBrushMode(mode)}
                >
                  <Text style={[styles.largeButtonText, brushMode === mode && styles.activeButtonText]}>
                    {mode}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );
      
      case 'size':
        return (
          <View style={styles.content}>
            <View style={styles.largeButtonGrid}>
              {[0.5, 1, 2, 3, 5, 10].map(size => (
                <TouchableOpacity
                  key={size}
                  style={[styles.largeButton, brushSize === size && styles.activeButton]}
                  onPress={() => changeBrushSize(size)}
                >
                  <Text style={[styles.largeButtonText, brushSize === size && styles.activeButtonText]}>
                    {size}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );
      
      case 'color':
        return (
          <View style={styles.content}>
            <View style={styles.colorGrid}>
              {colors.map(color => (
                <TouchableOpacity
                  key={color.name}
                  style={[
                    styles.largeColorButton,
                    { backgroundColor: color.hex },
                    selectedColor === color.name && styles.activeColorButton
                  ]}
                  onPress={() => changeColor(color.name)}
                />
              ))}
            </View>
            <View style={styles.customColorSection}>
              <TouchableOpacity 
                style={[styles.colorPreview, { backgroundColor: customColor }]}
                onPress={() => changeCustomColor(customColor)}
              >
                <Text style={styles.applyText}>Apply</Text>
              </TouchableOpacity>
              <TextInput
                style={styles.colorInput}
                value={customColor}
                onChangeText={setCustomColor}
                onSubmitEditing={() => changeCustomColor(customColor)}
                onBlur={() => changeCustomColor(customColor)}
                placeholder="#1A1A1A"
                placeholderTextColor="#999"
                returnKeyType="done"
              />
            </View>
          </View>
        );
      
      case 'more':
        return (
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionLabel}>INK EFFECT</Text>
            <View style={styles.largeButtonGrid}>
              {['飛', '壓', '麥', '鹽', '染', '毛'].map((effect, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[styles.largeButton, inkEffect === idx && styles.activeButton]}
                  onPress={() => changeInkEffect(idx)}
                >
                  <Text style={[styles.largeButtonText, inkEffect === idx && styles.activeButtonText]}>
                    {effect}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.sectionLabel, { marginTop: 12 }]}>PATH ROTATION</Text>
            <View style={styles.largeButtonGrid}>
              {['Off', '1', '2', '3'].map((label, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[styles.largeButton, pathRotation === idx && styles.activeButton]}
                  onPress={() => changePathRotation(idx)}
                >
                  <Text style={[styles.largeButtonText, pathRotation === idx && styles.activeButtonText]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.clearButton} onPress={clearCanvas}>
              <Text style={styles.clearButtonText}>Clear Canvas</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.downloadButton} onPress={() => downloadDrawing()}>
              <Text style={styles.downloadButtonText}>Download PNG</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.downloadButton} onPress={() => downloadLines()}>
              <Text style={styles.downloadButtonText}>Download Lines</Text>
            </TouchableOpacity>

            <Text style={[styles.sectionLabel, { marginTop: 12 }]}>BACKGROUND</Text>
            <View style={styles.bgColorSection}>
              <TextInput
                style={styles.colorInput}
                value={customColor}
                onChangeText={setCustomColor}
                onSubmitEditing={() => changeCanvasBg(customColor)}
                placeholder="#FFFFFF"
                placeholderTextColor="#999"
                returnKeyType="done"
              />
              <TouchableOpacity 
                style={[styles.colorPreview, { backgroundColor: customColor }]}
                onPress={() => changeCanvasBg(customColor)}
              >
                <Text style={styles.applyText}>BG</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        );
      
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Tab Bar - Large touch targets at bottom */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeSection === 'brush' && styles.activeTab]}
          onPress={() => setActiveSection('brush')}
          activeOpacity={0.7}
        >
          <Text style={styles.tabIcon}>🖌️</Text>
          <Text style={[styles.tabLabel, activeSection === 'brush' && styles.activeTabLabel]}>
            Brush
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeSection === 'size' && styles.activeTab]}
          onPress={() => setActiveSection('size')}
          activeOpacity={0.7}
        >
          <Text style={styles.tabIcon}>📏</Text>
          <Text style={[styles.tabLabel, activeSection === 'size' && styles.activeTabLabel]}>
            Size
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeSection === 'color' && styles.activeTab]}
          onPress={() => setActiveSection('color')}
          activeOpacity={0.7}
        >
          <Text style={styles.tabIcon}>🎨</Text>
          <Text style={[styles.tabLabel, activeSection === 'color' && styles.activeTabLabel]}>
            Color
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeSection === 'more' && styles.activeTab]}
          onPress={() => setActiveSection('more')}
          activeOpacity={0.7}
        >
          <Text style={styles.tabIcon}>⚙️</Text>
          <Text style={[styles.tabLabel, activeSection === 'more' && styles.activeTabLabel]}>
            More
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content Area - Above tabs for easy thumb reach */}
      {renderContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 20,
    paddingBottom: 34, // iPhone home indicator space
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    borderBottomWidth: 0.5,
    borderBottomColor: '#e0e0e0',
    paddingTop: 4,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    paddingBottom: 8,
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: '#007AFF',
  },
  tabIcon: {
    fontSize: 24,
    marginBottom: 2,
  },
  tabLabel: {
    fontSize: 11,
    color: '#8e8e93',
    fontWeight: '500',
  },
  activeTabLabel: {
    color: '#007AFF',
    fontWeight: '600',
  },
  content: {
    padding: 12,
    height: 160,
    minHeight: 160,
  },
  contentTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8e8e93',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  largeButtonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  largeButton: {
    backgroundColor: '#f2f2f7',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    minWidth: 60,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  activeButton: {
    backgroundColor: '#007AFF',
  },
  largeButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  activeButtonText: {
    color: '#fff',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  largeColorButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  activeColorButton: {
    borderColor: '#007AFF',
    borderWidth: 4,
  },
  customColorSection: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    alignItems: 'center',
  },
  colorInput: {
    flex: 1,
    backgroundColor: '#f2f2f7',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
  colorPreview: {
    width: 80,
    height: 52,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#d1d1d6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  clearButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  downloadButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  downloadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  bgColorSection: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
});
