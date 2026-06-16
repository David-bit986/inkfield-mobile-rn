import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, ActivityIndicator, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import { useState, useEffect, useRef } from 'react';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import BottomMenu from './components/BottomMenu';

export default function App() {
  const [loading, setLoading] = useState(true);
  const webViewRef = useRef(null);

  // Handle messages from WebView (for downloading images)
  const onMessage = async (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'DOWNLOAD_IMAGE') {
        const base64Code = data.payload.split('data:image/png;base64,')[1];
        const filename = FileSystem.documentDirectory + data.filename;
        
        // Use string 'base64' directly to avoid enum compatibility issues
        await FileSystem.writeAsStringAsync(filename, base64Code, {
          encoding: 'base64',
        });
        
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(filename, {
            mimeType: 'image/png',
            dialogTitle: 'Save or share your inkField art',
            UTI: 'public.png'
          });
        } else {
          Alert.alert('Error', 'Sharing is not available on this device');
        }
      } else if (data.type === 'ERROR') {
        console.error('WebView Error:', data.message);
        Alert.alert('Canvas Error', data.message);
      }
    } catch (error) {
      console.error('Failed to parse message from WebView:', error);
      Alert.alert('Download Error', 'Could not process the image.');
    }
  };

  // JavaScript to inject that hides unwanted panels
  const hideUnwantedPanels = `
    (function() {
      // Hide Art System Log (message overlay)
      const messageOverlay = document.getElementById('message-overlay');
      if (messageOverlay) {
        messageOverlay.style.display = 'none';
      }

      // Hide Flow Effect Panel
      const flowPanel = document.getElementById('flow-effect-panel');
      if (flowPanel) {
        flowPanel.style.display = 'none';
      }

      // Hide Flow Effect Hint button
      const flowHint = document.getElementById('flow-hint');
      if (flowHint) {
        flowHint.style.display = 'none';
      }

      // Hide the original Brush Control Panel (we have our own)
      const controlPanel = document.getElementById('control-panel');
      if (controlPanel) {
        controlPanel.style.display = 'none';
      }

      // Hide Brush Control Hint
      const brushHint = document.getElementById('brush-hint');
      if (brushHint) {
        brushHint.style.display = 'none';
      }

      // Hide Effect Control Panel (we have our own)
      const effectPanel = document.getElementById('effect-control-panel');
      if (effectPanel) {
        effectPanel.style.display = 'none';
      }

      // Hide Effect Control Hint
      const effectHint = document.getElementById('effect-hint');
      if (effectHint) {
        effectHint.style.display = 'none';
      }

      // Hide Mask Panel
      const maskPanel = document.getElementById('mask-panel');
      if (maskPanel) {
        maskPanel.style.display = 'none';
      }

      // Hide Mask Hint
      const maskHint = document.getElementById('mask-hint');
      if (maskHint) {
        maskHint.style.display = 'none';
      }

      // Hide toggle hint (Art System Log button)
      const toggleHint = document.getElementById('toggle-hint');
      if (toggleHint) {
        toggleHint.style.display = 'none';
      }

      // Hide zen mode button (≡ / ＊)
      const zenBtn = document.getElementById('zen-mode-btn');
      if (zenBtn) {
        zenBtn.style.display = 'none';
      }

      // Hide collect panels button (◎)
      const collectBtn = document.getElementById('collect-panels-btn');
      if (collectBtn) {
        collectBtn.style.display = 'none';
      }

      // Hide ref image toggle button
      const refBtn = document.getElementById('ref-image-toggle-btn');
      if (refBtn) {
        refBtn.style.display = 'none';
      }

      // Hide all hint buttons with class toggle-hint
      const allHints = document.querySelectorAll('.toggle-hint');
      allHints.forEach(hint => {
        hint.style.display = 'none';
      });

      // Hide all hint buttons with class artist-only
      const allArtistOnly = document.querySelectorAll('.artist-only');
      allArtistOnly.forEach(elem => {
        if (elem.classList.contains('toggle-hint') || 
            elem.id.includes('hint') || 
            elem.id.includes('btn')) {
          elem.style.display = 'none';
        }
      });

      // Use CSS to hide any remaining UI buttons
      const style = document.createElement('style');
      style.textContent = \`
        #zen-mode-btn,
        #collect-panels-btn,
        #ref-image-toggle-btn,
        .toggle-hint,
        .toggle-hint-btn {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
          pointer-events: none !important;
        }
        
        /* Remove any extra spacing but keep canvas natural positioning */
        body, html {
          margin: 0 !important;
          padding: 0 !important;
        }
      \`;
      document.head.appendChild(style);

      console.log('InkField Mobile: All unwanted UI elements hidden');
    })();
    true;
  `;

  const onWebViewLoad = () => {
    setLoading(false);
    // Inject the hiding script immediately after page loads
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript(hideUnwantedPanels);
      
      // Inject again after 1 second to catch any delayed elements
      setTimeout(() => {
        if (webViewRef.current) {
          webViewRef.current.injectJavaScript(hideUnwantedPanels);
        }
      }, 1000);
      
      // And once more after 3 seconds to be sure
      setTimeout(() => {
        if (webViewRef.current) {
          webViewRef.current.injectJavaScript(hideUnwantedPanels);
        }
      }, 3000);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <WebView
        ref={webViewRef}
        source={{ uri: 'https://ileivoivm.github.io/inkField/?_artist:1' }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowFileAccess={true}
        allowUniversalAccessFromFileURLs={true}
        allowFileAccessFromFileURLs={true}
        originWhitelist={['*']}
        mixedContentMode="always"
        mediaPlaybackRequiresUserAction={false}
        onLoadEnd={onWebViewLoad}
        onMessage={onMessage}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={[styles.container, styles.center]}>
            <ActivityIndicator size="large" color="#4ecca3" />
          </View>
        )}
      />
      
      {!loading && <BottomMenu webViewRef={webViewRef} />}
      
      <StatusBar style="light" />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  webview: {
    flex: 1,
  },
});
