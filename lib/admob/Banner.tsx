import {View} from "react-native";
import * as Device from "expo-device";
import React, {useState} from "react";
import {BannerAd, BannerAdSize, TestIds} from "react-native-google-mobile-ads";

const iosAdmobBanner = process.env.EXPO_PUBLIC_BANNER_AD_ID || TestIds.BANNER;
const androidAdmobBanner = process.env.EXPO_PUBLIC_BANNER_AD_ID || TestIds.BANNER;
const productionID = Device.osName === "Android" ? androidAdmobBanner : iosAdmobBanner;
const adsEnabled = process.env.EXPO_PUBLIC_ADS_ENABLED === "true";

const BannerAdmob = () => {
  const [isAdLoaded, setIsAdLoaded] = useState<boolean>(false);
  console.log("Ad loaded:", adsEnabled ? androidAdmobBanner : "Disabled");

  return adsEnabled ? (
    <View style={{height: isAdLoaded ? "auto" : 0}}>
      <BannerAd
        // It is extremely important to use test IDs as you can be banned/restricted by Google AdMob for inappropriately using real ad banners during testing
        unitId={__DEV__ ? TestIds.BANNER : productionID}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
          // You can change this setting depending on whether you want to use the permissions tracking we set up in the initializing
        }}
        onAdLoaded={() => {
          setIsAdLoaded(true);
        }}
      />
    </View>
  ) : (
    <></>
  );
};

export default BannerAdmob;
