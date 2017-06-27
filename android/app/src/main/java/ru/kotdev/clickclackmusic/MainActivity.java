package ru.kotdev.clickclackmusic;

import com.facebook.react.ReactActivity;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

public class MainActivity extends ReactActivity {
    ReactContext reactContext;

    /**
     * Returns the name of the main component registered from JavaScript.
     * This is used to schedule rendering of the component.
     */
    @Override
    protected String getMainComponentName() {
        return "ClickClack";
    }

    @Override
    protected void onStart() {
        super.onStart();
        reactContext = getReactInstanceManager().getCurrentReactContext();

        WritableMap params = Arguments.createMap();
        params.putString("event", "onStart");
        if(reactContext != null) {
            getReactInstanceManager().getCurrentReactContext()
                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit("ActivityStateChange", params);
        }
    }

    @Override
    public void onResume() {
        super.onResume();

        WritableMap params = Arguments.createMap();
        params.putString("event", "onResume");
        if(reactContext != null) {
            getReactInstanceManager().getCurrentReactContext()
                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit("ActivityStateChange", params);
        }
    }

    @Override
    public void onPause() {
        super.onPause();

        WritableMap params = Arguments.createMap();
        params.putString("event", "onPause");
        if(reactContext != null) {
            getReactInstanceManager().getCurrentReactContext()
                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit("ActivityStateChange", params);
        }
    }
}
