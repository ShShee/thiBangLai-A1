import React, { useState, useEffect } from "react";
import { SafeAreaView, TouchableOpacity, Image } from "react-native";
import {
  Layout,
  Text,
  Divider,
  TopNavigation,
  Icon,
} from "@ui-kitten/components";
import { styles } from "../../../style/styles";
import {
  AdMobBanner,
  AdMobInterstitial,
  PublisherBanner,
  AdMobRewarded,
  setTestDeviceIDAsync,
} from "expo-ads-admob";
import { db } from "../../../database/userData";

export const ThithuScreen = ({ navigation }) => {
  const navigateScreen = (ScreenName) => {
    navigation.navigate(ScreenName);
  };
  return (
    <SafeAreaView
      style={{
        flex: 1,
      }}
    >
      <TopNavigation title="Thi thử" alignment="center" />
      <Divider />
      <Layout
        style={{
          flex: 1,
          alignItems: "center",
        }}
      >
        <TouchableOpacity
          onPress={() => {
            db.transaction(
              (tx) => {
                tx.executeSql("DROP TABLE IF EXISTS answers;");
                tx.executeSql(
                  "create table if not exists answers (id integer primary key autoincrement, right text, important text);"
                );
                tx.executeSql(
                  "INSERT INTO answers (right,important) VALUES" +
                    "('false','false'),('false','false'),('false','false'),('false','false'),('false','false')," +
                    "('false','false'),('false','false'),('false','false'),('false','false'),('false','false')," +
                    "('false','false'),('false','false'),('false','false'),('false','false'),('false','false')," +
                    "('false','false'),('false','false'),('false','false'),('false','false'),('false','false')," +
                    "('false','false'),('false','false'),('false','false'),('false','false'),('false','false')," +
                    "('false','false'),('false','false'),('false','false'),('false','false'),('false','false');"
                );
              },
              (e) => console.log("Error: " + e)
            );
            navigateScreen("Bài thi");
          }}
          style={styles.ButtonTrangchuStyle}
          activeOpacity={0.5}
        >
          <Image
            source={require("../../../src/image/icons8-random1.png")}
            style={styles.ImageIconStyle}
          />
          <Text style={styles.TextStyle}>Tạo đề ngẫu nhiên</Text>
        </TouchableOpacity>
        <AdMobBanner
          bannerSize="mediumRectangle"
          adUnitID="ca-app-pub-3940256099942544/6300978111" // Test ID, Replace with your-admob-unit-id
          servePersonalizedAds // true or false
          onDidFailToReceiveAdWithError={this.bannerError}
          style={{ marginTop: "4%" }}
        />
      </Layout>
    </SafeAreaView>
  );
};
