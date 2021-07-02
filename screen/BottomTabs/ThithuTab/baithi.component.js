import React, {
  useRef,
  useState,
  memo,
  useLayoutEffect,
  useEffect,
} from "react";
import { Text, View, TouchableOpacity, Image } from "react-native";
import { styles } from "../../../style/styles";
import TaoBaithi from "../../../function/taoBaithi.component";
import { CountdownCircleTimer } from "react-native-countdown-circle-timer";
import { Dropdown } from "sharingan-rn-modal-dropdown";
import { db } from "../../../database/userData";
import Modal, {
  ModalTitle,
  ModalFooter,
  ModalContent,
  ModalButton,
  ScaleAnimation,
} from "react-native-modals";
import {
  AdMobBanner,
  AdMobInterstitial,
  PublisherBanner,
  AdMobRewarded,
} from "expo-ads-admob";

const timerProps = {
  isPlaying: true,
  size: 70,
  strokeWidth: 8,
};
const children = ({ remainingTime }) => {
  const minutes = Math.floor(remainingTime / 60);
  const seconds = remainingTime % 60;

  return `${minutes}:${seconds}`;
};

const url = "https://thi-gplx.herokuapp.com/A1";

//AdMobInterstitial.requestAd().then(() => AdMobInterstitial.showAd());

export const BaithiScreen = ({ navigation }) => {
  const [diem, setDiem] = useState({ total: 0, state: false });
  const [nopBai, setNopbai] = useState(false);
  const [arrayAns, setArrayAns] = useState(Array(30).fill("false"));
  const [ready, setReady] = useState(false);
  const [IsLiet, setLiet] = useState(true);
  const trigger = useRef(null);
  const [timeOut, setTimeOut] = useState(false);
  const [modal, setModal] = useState(false);
  const [questionList, setQuestionList] = useState([]);

  //Load du lieu tu server
  useEffect(() => {
    AdMobInterstitial.showAdAsync();
    AdMobInterstitial.requestAdAsync();
    AdMobInterstitial.addEventListener("interstitialDidClose", () => {
      setReady(true);
    });
    fetch(url + "/TaoDe")
      .then((response) => {
        return response.json();
      })
      .then((response) => {
        setQuestionList(response);
      });
  }, []);

  //Ngan quay ve khi chua load xong
  useEffect(
    () =>
      navigation.addListener("beforeRemove", (e) => {
        if (questionList[0] != null) {
          // If we don't have unsaved changes, then we don't need to do anything
          return;
        }

        // Prevent default behavior of leaving the screen
        AdMobInterstitial.requestAdAsync();
        e.preventDefault();
      }),
    [navigation, questionList]
  );

  //Nop bai
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => {
            if (nopBai != true) {
              setModal(true);
            }
          }}
          activeOpacity={0.5}
          style={{ marginRight: 20 }}
        >
          <Text>{nopBai != true ? "Nộp bài" : "Kết quả"}</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, nopBai]);

  //Tinh diem sau khi nopbai
  const getData = (part) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          "select count(*) from answers where important='true' and right='false'",
          [],
          (_, { rows }) => {
            setLiet(rows.item(0)["count(*)"] != 0 ? true : false);
          }
        );
        tx.executeSql("select * from answers", [], (_, { rows }) => {
          let array = [];
          for (let i = 0; i < rows.length; i++) {
            array.push(rows.item(i)["right"]);
          }
          setArrayAns(array);
        });
        tx.executeSql(
          "select count(*) from answers where right='true'",
          [],
          (_, { rows }) => {
            setDiem({ total: rows.item(0)["count(*)"], state: true });
          }
        );
      },
      (e) => console.log("Error: " + e)
    );
  };

  //Scroll select
  const onChangeSS = (value) => {
    //setValueSS(value);
    trigger.current.scrollTo(parseInt(value) - 1);
  };

  //Set select icon
  const setImage = (index) => {
    if (nopBai == true) {
      if (arrayAns[index] == "false") {
        return "https://i.imgur.com/zYHIHgB.png";
      } else {
        return "https://i.imgur.com/btuxRiD.png";
      }
    } else {
      if (questionList[index + 1].important == false) {
        return "https://i.imgur.com/M2vv9bM.png";
      } else {
        return "https://i.imgur.com/EFlOk28.png";
      }
    }
  };

  //Hien thi dau hay rot
  const setColor = () => {
    if (nopBai == true) {
      if (diem.state == false) return "#ffff1a";
      else if (diem.total < 21 || IsLiet == true) {
        return "#ff1a1a";
      } else return "#00ff00";
    } else return "#8c1aff";
  };

  //Tao data select
  const data = Array(questionList[0] != null ? questionList.length - 1 : 0)
    .fill(null)
    .map((value, index) => ({
      value: (index + 1).toString(),
      label: "Câu " + (index + 1).toString(),
      avatarSource: {
        uri: setImage(index),
      },
    }));

  return (
    <View style={{ flex: 1 }}>
      {questionList[0] != null && ready && (
        <View style={styles.viewSelectTime}>
          <Dropdown
            label="Chọn câu hỏi"
            data={data}
            enableAvatar
            disableSort
            onChange={onChangeSS}
          />
          <CountdownCircleTimer
            {...timerProps}
            duration={1140}
            colors={[[setColor(), 1]]}
            onComplete={() => {
              if (nopBai != true) {
                setTimeOut(true);
                setModal(true);
              }
              return [true];
            }}
          >
            {({ remainingTime, animatedColor }) => {
              if (nopBai == false)
                return (
                  <Text>
                    {Math.floor(remainingTime / 60)}:{remainingTime % 60}
                  </Text>
                );
              else {
                return nopBai == true && diem.state == false ? (
                  <Image
                    source={require("../../../src/image/loading.gif")}
                    style={{ width: 39, height: 39 }}
                  />
                ) : (
                  <Text>{diem.total}/25</Text>
                );
              }
            }}
          </CountdownCircleTimer>
        </View>
      )}
      <TaoBaithi
        trigger={trigger}
        questionList={questionList}
        nopBai={nopBai}
        baiThi={true}
        state={diem.state}
      />
      <Modal
        width={0.9}
        visible={modal}
        onSwipeOut={() => setModal(false)}
        modalAnimation={new ScaleAnimation()}
        onHardwareBackPress={() => {
          console.log("onHardwareBackPress");
          setModal(false);
          return true;
        }}
        modalTitle={<ModalTitle title="Xác nhận" hasTitleBar={false} />}
        actions={[
          <ModalButton
            text="DISMISS"
            onPress={() => {
              setModal(false);
            }}
            key="button-1"
          />,
        ]}
        footer={
          <ModalFooter>
            <ModalButton
              text="Từ chối"
              bordered
              onPress={() => {
                if (timeOut == true) navigation.goBack();
                setModal(false);
              }}
              key="button-1"
            />

            <ModalButton
              text="Đồng ý"
              bordered
              onPress={() => {
                getData();
                setNopbai(true);
                setModal(false);
              }}
              key="button-2"
            />
          </ModalFooter>
        }
      >
        <ModalContent
          style={{
            backgroundColor: "#FFF",
            flexDirection: "column",
          }}
        >
          <Text style={{ fontSize: 16, alignSelf: "center", marginLeft: "5%" }}>
            {timeOut == false
              ? "Bạn có đồng ý nộp phần thi của mình ?"
              : "Hết thời gian xin vui lòng nộp bài !"}
          </Text>
        </ModalContent>
      </Modal>
    </View>
  );
};
