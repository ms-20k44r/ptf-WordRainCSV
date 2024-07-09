// main.js

let orgData; //取得したファイル

let myObjArray = [];
let divideOrgData = [];
let divideLastIndexArray = [];
let chunkSize = 20;
let bookmarkItemList = [];

const observerElement = document.querySelector("#observer");
const field = document.querySelector("#field");
const section = document.querySelector("section");
const title = document.querySelector(".title");
const openFileReadOptionModal = document.getElementById("openFileReadOptionModal");
const filePickerBtn = document.getElementById("filePickerBtn");
const dropArea = document.getElementById("dropArea");
const useDemoDataBtn = document.getElementById("useDemoDataBtn");
const titleChoicedBtn = document.getElementById("titleChoicedBtn");
const morePlayBtn = document.getElementById("morePlayBtn");
const testBtn = document.getElementById("testBtn");
const ditalesContainer = document.querySelector(".modal-container");
const ditalesBoby = document.querySelector(".modal-body");
const ditalesCloseBtn = document.querySelector(".modal-close");
const ditalesContent = document.querySelector(".modal-content");
const amagoiContainer = document.querySelector(".amagoi-container");
const amagoiBoby = document.querySelector(".amagoi-body");
const amagoiCloseBtn = document.querySelector(".amagoi-close");
const amagoiContent = document.querySelector(".amagoi-content");
const titleSelectContainer = document.querySelector(".titleSelectContainer");
const csvTitle = document.querySelector("#csvTitle");
const InfoUseDemoData = document.querySelector("#InfoUseDemoData");
const amatubuSlider = document.querySelector("#amatubuSlider");
const oAmeSelect = document.querySelector("#oAmeSelect");
const setting = document.querySelector("#setting");
const settingContainer = document.querySelector(".setting-container");
const settingBoby = document.querySelector(".setting-body");
const settingCloseBtn = document.querySelector(".setting-close");
const settingContent = document.querySelector(".setting-content");
const propVisibilityCheckBoxContainer = document.querySelector("#propVisibilityCheckBoxContainer");
const bookmark = document.querySelector("#bookmark"); //ブックマーク画面の方
const itemBookmark = document.querySelector("#itemBookmark"); //詳細画面の中の方
const bmAllDelete = document.querySelector("#bmAllDelete");
const bookmarkContainer = document.querySelector(".bookmark-container");
const bookmarkContent = document.querySelector(".bookmark-content");
const bmItemListContainer = document.querySelector("#bmItemListContainer");
const fa_github = document.querySelector(".fa-github");
const iframeElement = document.querySelector(".iframeElement");

let raining = false;
let oAmeOption = 2000;
let to = section.clientHeight + 220; //+にしただけAnimが長く続く(場外に引っ張れる) + 180
let shownItemDitails = false;
let shownBookmark = false;
let titlePropatyList = [];
let hiddenPropList = [];
let titleSelectIndex = 0;
let orgDataMod = { fileName: null, lastModified: null };
let currentLoadedCSV = { preOrgData: null, prefileName: null, prelastModified: null }; //直近に読み込んでOrgDataを作成した
let timeoutQ = [];
let controller = new AbortController();
let signal = controller.signal;
let entryDataRaining = true;

window.addEventListener("load", () => {
    console.log("loaded.");
    settingApply();
    entrySetting();
});
function variableInit() {
    //他のデータが選択された時に呼ばれる 初期化
    raining = false;
    controller.abort(); //非同期の分割データ処理が実行中の場合は中止

    divideLastIndexArray = [];
    divideOrgData = [];
    myObjArray = [];

    orgDataMod = { fileName: null, lastModified: null };
    //HTMLを削除
    while (field.firstChild) {
        field.removeChild(field.firstChild); //既存のHTML雨要素を削除
    }
    csvTitle.textContent = "";
    //アニメーション実行の非同期タイマーも停止
    console.log(`削除前timeoutQ: ${timeoutQ}`);
    timeoutQ.forEach((timeoutID) => {
        clearTimeout(timeoutID);
    });
    timeoutQ = [];
    deleteAllBookmark(); //ブックマークも全削除
    entryDataRaining = false; //entrydataが終了したのでfalseに
}
function settingApply() {
    let targets = document.querySelectorAll(`input[type='radio'][name='colorMode']`);
    for (let target of targets) {
        target.addEventListener("change", () => {
            // カラー/スタイルの設定を適用する
            if (target.checked) {
                setColorTheme(target.value);
            }
        });
    }
}
testBtn.addEventListener("click", () => {
    console.log(bookmarkItemList);
});
amatubuSlider.addEventListener("input", (e) => {
    document.documentElement.style.setProperty("--fontSixe-middle", `${e.target.value}px`); //CSSの:rootセレクタのstyle
});
oAmeSelect.addEventListener("change", () => {
    oAmeOption = oAmeSelect.value;
});
const settingPropVisibility = () => {
    while (propVisibilityCheckBoxContainer.firstChild) {
        propVisibilityCheckBoxContainer.removeChild(propVisibilityCheckBoxContainer.firstChild); //既存のアイテムを削除
    }
    // let noTitlePropatyList = titlePropatyList.splice(titleSelectIndex, 1); // index番目の要素から1つの要素を削除(タイトルpropのみ削除)※破壊
    for (const [index, prop] of titlePropatyList.entries()) {
        // console.log([index, prop]);
        if (index == titleSelectIndex) {
            continue;
        }
        let contentRow = `<div class="propVisibility">
        <input type="checkbox" id="cb${index}" name="propVisibility" value="${prop}" checked />
        <label for="cb${index}">${prop}</label></div>`;
        propVisibilityCheckBoxContainer.appendChild(createElementFromHTML(contentRow));
    }

    let targets = document.querySelectorAll(`input[type='checkbox'][name='propVisibility']`);
    for (let target of targets) {
        target.addEventListener("change", () => {
            //表示/非表示を管理する falseになったらhiddenPropListに追加、trueになったら削除
            if (!target.checked) {
                if (!hiddenPropList.includes(target.value)) {
                    hiddenPropList.push(target.value);
                }
            } else {
                hiddenPropList = hiddenPropList.filter((prop) => prop !== target.value);
            }
        });
    }
    const fieldPropVisibility = document.querySelector("#fieldPropVisibility");
    fieldPropVisibility.style.display = "block";
};

//デモデータを流す
useDemoDataBtn.addEventListener("click", () => {
    displayInfoUseDemoData(true);
    // console.log(demoOrgData1);
    currentLoadedCSV.preOrgData = demoOrgData1; //デモデータを指定
    titlePropatyList = titlePropatyListDemoOrgData1;
    titleSelectIndex = titleSelectValueDemoOrgData1;
    currentLoadedCSV.prefileName = "demo.csv";
    currentLoadedCSV.prelastModified = "1111";
    //HTMLの表示を変更
    const titleSelect = document.querySelector("#titleSelect");
    while (titleSelect.firstChild) {
        titleSelect.removeChild(titleSelect.firstChild); //既存のリストアイテムを削除
    }
    orgData = currentLoadedCSV.preOrgData;
    amagoiContainer.classList.remove("active"); //雨乞いモーダルも閉じる
    doDivideOrgData(orgData);
});

filePickerBtn.addEventListener("change", (e) => {
    const files = e.target.files;
    console.log(files);
    if (files.length > 0) {
        //今降っている雨と同じデータ(ファイル名も更新日も一緒)なら何もしない(今降っている雨と同じです)
        let sameCheck = sameChecks(files[0]);
        if (sameCheck[0] === 3) {
            //ファイルが変更されたので処理をする
            createCSVtoJSON(files[0], sameCheck[1]);
        } else if (sameCheck[0] === 2) {
            //処理中のファイルと等しい
        } else {
            //現在降っている雨と等しい
        }
    } else {
        //選択されていない ->何も実行しない
        //console.log("ファイル未選択");
    }
});
// ドロップ時の処理
dropArea.addEventListener("drop", (e) => {
    e.preventDefault();

    if (dropArea.classList.contains("invalid")) {
        //要件外ファイルの場合は処理をしないで終了
        dropArea.classList.remove("invalid");
        return;
    }

    dropArea.classList.remove("dragover");
    // ドロップしたファイルの取得
    const files = e.dataTransfer.files;
    // console.log(files);

    // CSVファイルのみを許可　※バリデーションチェック済みだけど一応
    if (files.length === 1 && files[0].type === "text/csv") {
        // 取得したファイルをinput[type=file]へ格納
        filePickerBtn.files = files;
        // changeイベントを手動で発火
        const event = new Event("change", { bubbles: true });
        filePickerBtn.dispatchEvent(event);
    }
});
// ドラッグオーバー時の処理
dropArea.addEventListener("dragover", (e) => {
    e.preventDefault();

    if (dropArea.classList.contains("invalid")) {
        return;
    }
    const items = e.dataTransfer.items; //バリデーションチェック
    if (items.length === 1 && items[0].kind === "file" && items[0].type === "text/csv") {
        dropArea.classList.add("dragover"); //要件を満たすのでdragoverクラス付与
        dropArea.classList.remove("invalid");
    } else {
        dropArea.classList.add("invalid"); //要件外なのでinvalidクラス付与
        dropArea.classList.remove("dragover");
    }
});
// ドラッグアウト時の処理
dropArea.addEventListener("dragleave", (e) => {
    e.preventDefault();
    dropArea.classList.remove("dragover");
    dropArea.classList.remove("invalid");
});

//非同期処理で全てのdivideOrgDataを処理して大元のmyObjArrayに追加していく
const processAllDatacreateDataObj = async (divideOrgData, signal) => {
    try {
        for (let i = 0; i < divideOrgData.length; i++) {
            // キャンセルされていないか確認
            signal.throwIfAborted(); //キャンセルされていたらcatch errorに。

            const divideMyObj = await createDataObj(divideOrgData[i], i);
            const result = await completedDataObj(divideMyObj, signal); //divideOrgDataをsvg化してHTMLに挿入＆myObjArrayに挿入
            // console.log(result);
            if (result && i === 0) {
                //初回分のデータが準備できたら降雨トリガーを実行する
                completedFirstDataObj();
            }
        }
        return "◎全データの処理が完了"; //呼び出し元に非同期処理の完了を伝える
    } catch (error) {
        if (error.name === "AbortError") {
            return "×データ処理がキャンセルされました(processAllDatacreateDataObj)";
        }
        throw error; // 予期しないエラーは再スロー
    }
};
// 5秒間待つ関数(テスト用)
const delay = (ms) => {
    console.log("…五秒待機…");
    return new Promise((resolve) => setTimeout(resolve, ms));
};

//divideOrgDataの最初の要素の処理が完了した時に呼び出される、雨を降らし始める関数
const completedFirstDataObj = () => {
    //現在のファイル名等を設定
    orgDataMod.fileName = currentLoadedCSV.prefileName;
    orgDataMod.lastModified = currentLoadedCSV.prelastModified;
    console.log("///降雨開始///");
    raining = true;
    doRandomDelay(100); //!降雨
    //設定画面のプロパティ表示/非表示チェックリストを設定
    settingPropVisibility();
};

//OrgDataを分割処理->非同期関数からcreateDataObjへ　(CSVtoJSONから呼ばれる)
const doDivideOrgData = (orgData) => {
    variableInit(); //初期化
    //orgDataをchunkSize件ごとに分割
    for (let i = 0; i < orgData.length; i += chunkSize) {
        let chunk = orgData.slice(i, i + chunkSize);
        divideOrgData.push(chunk);
    }
    // 最後のインデックスをdivideLastIndexArrayに追加
    for (let i = 1; i <= divideOrgData.length; i++) {
        if (i !== divideOrgData.length) {
            divideLastIndexArray.push(i * chunkSize - 1);
        } else {
            divideLastIndexArray.push(orgData.length - 1); //最後のみorgDataのラストインデックス
        }
    }
    console.log(divideOrgData);
    console.log(divideLastIndexArray);

    controller = new AbortController();
    signal = controller.signal;
    processAllDatacreateDataObj(divideOrgData, signal)
        .then((results) => {
            console.log(results); // 分割できたので順に処理する非同期関数に渡し、全データ処理が完了したらコールバック受け取って表示
        })
        .catch((error) => {
            console.error("処理のキャンセル:", error); //処理がキャンセルされた時(AbortError)に出力される
        });
};

//ユーザー選択のCSVをJSONに変換する
const createCSVtoJSON = (file, nowLoadedCSVfileMeta) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => {
        const { result } = reader;
        //文字コードをunicodeへ変換
        const conv = Encoding.convert(new Uint8Array(result), {
            to: "UNICODE",
            from: "AUTO",
        });
        const unicodeStr = Encoding.codeToString(conv);

        //ParaParseを使ってUnicode文字列のCSVをパース
        Papa.parse(unicodeStr, {
            header: true, // ヘッダー行がある場合はtrue
            complete: function (results) {
                //パースが完了したら、結果を表示する
                console.log(results);
                let resultData = results.data;
                const errorData = results.errors;
                //エラーの行数を配列に格納
                const errorsArray = [];
                for (let i = 0; i < errorData.length; i++) {
                    errorsArray.push(results.errors[i].row);
                }
                //resultsデータからエラー行を排除する 配列インデックスの降順に評価
                errorsArray.toReversed().forEach((item) => {
                    resultData.splice(item, 1);
                });
                console.log(resultData);
                currentLoadedCSV.preOrgData = resultData; //preOrgDataに設定 OKボタン押下ではじめて処理されるのでまだ未確定だから
                currentLoadedCSV.prefileName = nowLoadedCSVfileMeta[0];
                currentLoadedCSV.prelastModified = nowLoadedCSVfileMeta[1];
                //HTMLの表示を変更
                const titleSelect = document.querySelector("#titleSelect");
                while (titleSelect.firstChild) {
                    titleSelect.removeChild(titleSelect.firstChild); //既存のリストアイテムを削除
                }
                let titlePropList = [];
                results.meta.fields.forEach((item, index) => {
                    titlePropList.push(item);
                    let contentRow = `<option class="titleList" value="${index}">${item}</option>`;
                    titleSelect.appendChild(createElementFromHTML(contentRow));
                });
                csvTitle.textContent = `処理中のファイル…${nowLoadedCSVfileMeta[0]}`;
                titleSelectContainer.classList.add("active"); //タイトル行を選択画面を表示
                titleChoicedBtn.onclick = () => {
                    console.log(titleSelect.value);
                    displayInfoUseDemoData(false);
                    //OKボタン押下で独自オブジェクトに変換する関数を実行
                    orgData = currentLoadedCSV.preOrgData;
                    titlePropatyList = titlePropList;
                    titleSelectIndex = titleSelect.value;
                    csvTitle.textContent = `現在のファイル…${nowLoadedCSVfileMeta[0]}`;
                    titleSelectContainer.classList.remove("active"); //タイトル行選択画面を閉じる
                    amagoiContainer.classList.remove("active"); //雨乞いモーダルも閉じる
                    doDivideOrgData(orgData);
                };
            },
        });
    });
    reader.readAsArrayBuffer(file);
};

morePlayBtn.addEventListener("click", () => {
    if (raining) {
        doRandomDelay(30); //!追加の降雨
        morePlayBtn.disabled = true;
        setTimeout(() => {
            morePlayBtn.disabled = false;
            morePlayBtn.textContent = btnTextList[Math.floor(Math.random() * btnTextList.length)];
        }, 2000);
        let btnTextList = [
            "もっと降れ！",
            "どしゃ降れ！",
            "豊作祈願^^",
            "雨の恵みをッ!",
            "集中豪雨だ！",
            "フレ‐!フレ‐!",
            "もっと降れ！",
            "もっと降れ！",
            "もっと降れ！",
            "どしゃ降れ！",
        ];
    } else {
        console.log("まだ降ってない");
        document.querySelector(".tinyMessage.morePlay").classList.add("active");
        setTimeout(() => {
            document.querySelector(".tinyMessage.morePlay").classList.remove("active");
        }, 4000);
    }
});

field.addEventListener("click", (e) => {
    //既にアイテム詳細が表示中ならクリックを無効化
    if (shownItemDitails === false) {
        if (e.target.tagName === "TEXT") {
            shownItemDitails = true;
            if (entryDataRaining) {
                entryItemDetails(e.target.id);
            } else {
                showItemDetails(e.target.id);
            }
        }
    }
});
//ブックマークリストのタップでもアイテム詳細画面を表示する
bmItemListContainer.addEventListener("click", (e) => {
    if (shownItemDitails || e.target.id === "bmItemListContainer") return; //一応ね
    console.log(e.target.id);
    shownItemDitails = true;
    if (entryDataRaining) {
        entryItemDetails(e.target.id);
    } else {
        showItemDetails(e.target.id);
    }
});
const deleteAllBookmark = () => {
    let emptyList = [];
    bookmarkItemList = emptyList;
    while (bmItemListContainer.firstChild) {
        bmItemListContainer.removeChild(bmItemListContainer.firstChild);
    }
    console.log(`一括削除：${bookmarkItemList}`);
};
//ブックマークの一括削除
bmAllDelete.addEventListener("click", deleteAllBookmark);

//雨乞いモーダルを表示
openFileReadOptionModal.addEventListener("click", () => {
    amagoiContainer.classList.add("active");
});
amagoiCloseBtn.onclick = () => {
    amagoiContainer.classList.remove("active"); //closeボタン押下で閉じる
};
amagoiContainer.onclick = (e) => {
    //モーダルのグレー背景押下でも画面を閉じる
    if (!e.target.closest(".amagoi-body")) {
        //amagoiContainerがamagoi-bodyクラスの要素の内部にない場合に条件が真になる(->コンテンツクリックでは閉じない)
        amagoiContainer.classList.remove("active");
    }
};
//設定モーダルを表示
setting.onclick = () => {
    settingContainer.classList.add("active");
};
settingCloseBtn.onclick = () => {
    settingContainer.classList.remove("active"); //closeボタン押下で閉じる
};
settingContainer.onclick = (e) => {
    //モーダルのグレー背景押下でも画面を閉じる
    if (!e.target.closest(".setting-body")) {
        settingContainer.classList.remove("active");
    }
};
//ブックマークリストの表示/非表示を切り替え
bookmark.onclick = () => {
    if (shownBookmark) {
        bookmarkContainer.classList.remove("active");
        bookmark.classList.remove("active");
        shownBookmark = false;
    } else {
        bookmarkContainer.classList.add("active");
        bookmark.classList.add("active");
        shownBookmark = true;
    }
};
const addBookmarkContents = (id) => {
    //idからタイトル取得してリストアイテム作って末尾にHTML挿入
    let itemData = orgData[id];
    let titlePropName = titlePropatyList[titleSelectIndex];
    let itemTitle = itemData[titlePropName];
    let contentItem = `<li id="b${id}" data-id="${id}">${itemTitle}</li>`;
    bmItemListContainer.appendChild(createElementFromHTML(contentItem));
};
const removeBookmarkContents = (id) => {
    //idを持つリストアイテムのHTMLを削除
    //itemBookmark.dataset.id = id;
    let bmItem = document.querySelector(`#b${id}`);
    // let targetObj = document.getElementById(id);
    bmItemListContainer.removeChild(bmItem); //リストアイテムを削除
};

//詳細画面のブックマークボタン押下時の処理
itemBookmark.onclick = () => {
    let id = itemBookmark.dataset.id; //data属性からidを取得
    //クラスがactiveなら追加済みなので、リストから削除してクラス除去 その逆も処理
    if (itemBookmark.classList.contains("active")) {
        bookmarkItemList.splice(bookmarkItemList.indexOf(id), 1); //配列から指定要素を削除
        itemBookmark.classList.remove("active");
        console.log(`削除：${id}`);
        //HTML要素の削除
        removeBookmarkContents(id);
    } else {
        bookmarkItemList.push(id); //配列に追加
        itemBookmark.classList.add("active");
        console.log(`追加：${id}`);
        //HTML要素の追加
        addBookmarkContents(id);
    }
};

const showItemDetails = (id) => {
    // console.log(id);
    if (id.includes("t") || id.includes("b")) {
        //idをフォーマット
        id = id.slice(1);
    }
    let itemData = orgData[id];
    console.log(itemData);
    //アイテム詳細画面にコンテンツを設定
    setItemDitailsContents(id, itemData);
    ditalesContainer.classList.add("active"); //詳細画面をモーダル表示
};
const entryItemDetails = (id) => {
    if (id.includes("t") || id.includes("b")) {
        //idをフォーマット
        id = id.slice(1);
    }
    let itemData = orgData[id];
    console.log(itemData);
    //スタイル設定のためにクラス付与
    ditalesBoby.classList.add("entryModal");
    ditalesContent.classList.add("entryModal");
    //アイテム詳細画面にコンテンツを設定
    setEntryDitailsContents(id, itemData);
    ditalesContainer.classList.add("active"); //詳細画面をモーダル表示
};
const hideModal = () => {
    // 一時的に非表示クラスを追加
    ditalesContainer.classList.add("visibility-hidden");
    // クラスを削除する処理
    setTimeout(() => {
        iframeElement.classList.remove("active");
        ditalesContent.classList.remove("entryModal");
        ditalesBoby.classList.remove("entryModal");
        ditalesContainer.classList.remove("active");
        // 一時的に追加したクラスを削除
        ditalesContainer.classList.remove("visibility-hidden");
        shownItemDitails = false;
    }, 300); // CSSのtransitionと同じ時間（0.3秒）に設定
};
ditalesCloseBtn.onclick = () => {
    hideModal();
};
ditalesContainer.onclick = (e) => {
    //モーダルのグレー背景押下でも画面を閉じる
    if (!e.target.closest(".modal-body")) {
        //ditalesContainerがmodal-bodyクラスの要素の内部にない場合に条件が真になる(->コンテンツクリックでは閉じない)
        hideModal();
    }
};

const setURLContent = (keyValue, Index, contentsData) => {
    let contentUrl = `<div class="frex">
    <div class="listItem prop contentUrl">${keyValue[0]}：<i class="fa-solid fa-arrow-up-right-from-square urlPrevew gg-external" title="小さなウィンドウで開く"  onclick='prevewUrl("${keyValue[1]}")'></i></div>
        <div class="listItem record contentUrl"><a href="${keyValue[1]}" target="_blank" rel="noopener noreferrer">${keyValue[1]}</a></div>
    </div></div>`;
    contentsData.push([Index, contentUrl]);
};
const setNormalContent = (keyValue, Index, contentsData, fontClass) => {
    let contentNormal = `<div class="frex"><div class="listItem prop contentNormal">${keyValue[0]}：</div><div class="listItem record contentNormal ${fontClass}">${keyValue[1]}</div></div>`;
    contentsData.push([Index, contentNormal]);
};
const prevewUrl = (url) => {
    console.log(`url: ${url}`);
    //新しいウィンドウで開く(optionで小さなウィンドウを指定)
    let option = "width=500,height=500,left=100,top=100";
    window.open(url, "URL-Preview", option);
};

const setItemDitailsContents = (id, itemData) => {
    //HTMLの表示を変更
    const itemList = document.querySelector(".item-list");
    while (itemList.firstChild) {
        itemList.removeChild(itemList.firstChild); //既存のリストアイテムを削除
    }
    //ブックマーク状態をチェック
    if (bookmarkItemList.includes(id)) {
        itemBookmark.classList.add("active"); //既に追加済みなのでクラス付与
    } else {
        itemBookmark.classList.remove("active"); //未追加状態なのでクラス削除
    }
    itemBookmark.dataset.id = id; //ブクマアイコンのデータ属性(data-id)にidを付与

    //タイトル行の抽出と設置
    let propName = titlePropatyList[titleSelectIndex];
    let contentTitle = `<div><div class="titlePropTxt">${propName}</div><div class="titlePropValue">${itemData[propName]}</div></div>`;
    itemList.appendChild(createElementFromHTML(contentTitle));

    let copyObj = JSON.parse(JSON.stringify(itemData)); //代入やprop削除しても元データを破壊しないために。
    //※itemDataやcopyObjの全プロパティが文字列になっていないと以降の文字数カウント等失敗するので注意(trueとかね)。CSVtoJSON通れば全プロパティが文字列になってる。
    //オブジェクトを生のまま保持している場合は文字列型に変換(してからカウント等)する必要がある。
    delete copyObj[propName];
    hiddenPropList.forEach((propName) => {
        delete copyObj[propName];
    });

    let contentsData = [];
    const re = /^https?:\/\/[\w\/:%#\$&\?\(\)~\.=\+\-]+$/g;
    //コンテンツのHTMLを作成
    Object.entries(copyObj).forEach((keyValue, Index) => {
        //文字数によってフォントサイズ変えるためのクラスを付与
        let fontClass = textCountFontsize(keyValue[1]);
        if (re.test(keyValue[1])) {
            //正規表現でURLかどうかチェック
            setURLContent(keyValue, Index, contentsData);
        } else {
            setNormalContent(keyValue, Index, contentsData, fontClass);
        }
    });
    //アイテムリストに順に追加する
    contentsData.sort((a, b) => a[0] - b[0]);
    contentsData.forEach((row) => {
        itemList.appendChild(createElementFromHTML(row[1]));
    });
};
const setEntryDitailsContents = (id, itemData) => {
    //ブックマーク状態をチェック
    if (bookmarkItemList.includes(id)) {
        itemBookmark.classList.add("active"); //既に追加済みなのでクラス付与
    } else {
        itemBookmark.classList.remove("active"); //未追加状態なのでクラス削除
    }
    itemBookmark.dataset.id = id; //ブクマアイコンのデータ属性(data-id)にidを付与

    //?HTMLをditalesContentの中に表示する
    const contentSrc = itemData.htmlSrc;
    // const contentSrc = itemData[htmlSrc];
    iframeElement.src = `${contentSrc}`;
    iframeElement.classList.add("active");
};

//データ生成createDataObjが完了した時に実行される
const completedDataObj = (divideMyObj, signal) => {
    try {
        console.log("completedDataObj: データ生成createDataObjが完了した");
        //HTMLの文字列からDOMへの変換
        let svgArray = divideMyObj.map((item) => item.svg); // 新しい配列を作成し、各オブジェクトのsvgプロパティの値を追加する
        //HTMLに全svgを挿入
        svgArray.forEach((svgElement) => {
            // キャンセルされていないか確認
            signal.throwIfAborted();
            field.appendChild(createElementFromHTML(svgElement));
        });

        //大元のmyObjArrayに追加
        myObjArray = myObjArray.concat(divideMyObj);
        console.log(myObjArray);
        return true; //
    } catch (error) {
        if (error.name === "AbortError") {
            return "×データ処理がキャンセルされました(completedDataObj)";
        }
        throw error; // 予期しないエラーは再スロー
    }
};

const dataTitleFormat = (title, obj) => {
    let atitude = 1;

    if (title.length === 0) {
        title = "無題";
    }
    let slicedTextAndByteCount = textByteCountSlice(String(title).trim());
    //文字数カウント　Shift_JISで半角1バイト全角2バイトで計算
    let textLength = slicedTextAndByteCount[1];

    if (textLength >= 1 && textLength <= 14) {
        // console.log("(日本語換算)1-7文字");
        atitude = 3;
    } else if (textLength >= 15 && textLength <= 26) {
        // console.log("9-13文字");
        atitude = 2;
    } else {
        // console.log("19-*文字");
        atitude = 1;
    }

    obj.atitude = atitude;
    return [slicedTextAndByteCount[0], atitude];
};
const textCountFontsize = (text) => {
    //詳細画面のValueのテキスト
    let fontClass = ""; //クラス無無し->.listItem既定値24px
    let slicedTextAndByteCount = textByteCountSlice(String(text).trim());
    //文字数カウント　Shift_JISで半角1バイト全角2バイトで計算
    let textLength = slicedTextAndByteCount[1];

    if (textLength >= 30 && textLength <= 70) {
        // 24pxで1行30位。3行以内
        fontClass = "fs22px";
    } else if (textLength >= 71 && textLength <= 120) {
        fontClass = "fs20px";
    } else if (textLength >= 121) {
        fontClass = "fs18px";
    }
    return fontClass;
};

//SVGを生成
const createSVG = (useTitleProp, index, obj) => {
    const reTextAndAtitude = dataTitleFormat(useTitleProp, obj);
    const fontSizeClass = getFontsize(reTextAndAtitude[1]);

    let customHtml = `<div id="${index}" class="obj">
    <text id="t${index}" class="textSelectNone ${fontSizeClass}" x="25" y="25" font-family="Verdana">${reTextAndAtitude[0]}</text></div>`;
    obj.svg = customHtml;
    return obj;
};

//一回に処理する分割データを引き渡してオブジェクトを作成
const createDataObj = (divideOrgData, divideIndex) => {
    let LastDivideLastIndex;
    //orgDataを基準に一意のid値を割り振るために使用するインデックスを取得
    if (divideIndex !== 0) {
        LastDivideLastIndex = divideLastIndexArray[divideIndex - 1];
    } else {
        LastDivideLastIndex = -1;
    }
    let useTitleProp = titlePropatyList[titleSelectIndex]; //タイトルとして使用するプロパティを取得
    let divideMyObj = []; //今回処理分を格納する

    for (let i = 1; i <= divideOrgData.length; i++) {
        let dataObj = { id: null, svg: null, atitude: null, isShown: false };
        let objId = LastDivideLastIndex + i;
        dataObj.id = objId;
        let title = divideOrgData[i - 1][useTitleProp]; //※変数としてプロパティ名を動的にアクセスする場合はブラケット記法じゃなきゃダメ
        let doneObj = createSVG(title, objId, dataObj); //この関数から他のdataObjプロパティも設定が完了する
        // console.log(`dataObj[${i}]: ${dataObj}`);
        divideMyObj[i - 1] = doneObj;
    }

    console.log(`divideMyObj: ${divideMyObj.length}`);
    return divideMyObj;
};

//表示するオブジェクトを選定
const getRandomShownObject = () => {
    let attempts = 10; //繰り返し上限
    let dataSize = myObjArray.length;
    for (let i = 0; i < attempts; i++) {
        //ランダムに一つ取得
        let randomIndex = Math.floor(Math.random() * dataSize);
        //取得データが表示中でなければ、idを返してこの関数の実行を終了
        if (!myObjArray[randomIndex].isShown) {
            return myObjArray[randomIndex].id;
        }
    }
    //以下は、繰り返し上限の試行でも取得できなかった場合に実行される
    let shownObjects = myObjArray.filter((item) => item.isShown === false);
    let itemLength = shownObjects.length;
    if (itemLength > 0) {
        //表示中オブジェクトの集まりからランダムに取得したオブジェクトのidを返す
        let randomIndex = Math.floor(Math.random() * itemLength);
        return shownObjects[randomIndex].id;
    } else {
        //表示中オブジェクトが存在しなければnullを返す
        return null;
    }
};

function createElementFromHTML(html) {
    const tempEl = document.createElement("div");
    tempEl.innerHTML = html;
    return tempEl.firstElementChild;
}
function textByteCountSlice(text) {
    let reText = text;
    let reTexted = false;
    let textLength = [...text].reduce((count, _char, index) => {
        const c = text.charCodeAt(count);
        if ((c >= 0x0 && c < 0x81) || c === 0xf8f0 || (c >= 0xff61 && c < 0xffa0) || (c >= 0xf8f1 && c < 0xf8f4)) {
            if (!reTexted && count + 1 > 34) {
                let santen = index <= text.lengthg - 1 ? "" : "…";
                reText = text.slice(0, index) + `${santen}`;
                reTexted = true;
            }
            return count + 1;
        } else {
            if (!reTexted && count + 1 > 34) {
                let santen = index <= text.lengthg - 1 ? "" : "…";
                reText = text.slice(0, index) + `${santen}`;
                // reText = text.slice(0, index + 1) + "…";
                reTexted = true;
            }
            return count + 2;
        }
    }, 0);
    // console.log(`${text}:${!reTexted ? "" : reText} ${textLength}`);
    return [reText, textLength];
}
function sameChecks(file) {
    let isSame;
    let fileName = file.name;
    let lastModified = file.lastModified;
    let nowLoadedCSVfileMeta = [fileName, lastModified];
    if (fileName === orgDataMod.fileName) {
        isSame = 1; //現在降っている雨と同じ
    } else if (lastModified === orgDataMod.lastModified) {
        isSame = 1; //現在降っている雨と同じ
    } else if (fileName === currentLoadedCSV.prefileName) {
        isSame = 2; //処理中のファイルと同じ
    } else if (lastModified === currentLoadedCSV.prelastModified) {
        isSame = 2; //処理中のファイルと同じ
    } else {
        isSame = 3; //異なるファイル
    }
    // console.log([fileName, lastModified]);
    return [isSame, nowLoadedCSVfileMeta];
}
function getFontsize(atitude) {
    switch (atitude) {
        case 1:
            return "fSmall"; // 既定値 14px
        case 2:
            return "fMiddle"; // 既定値 20px
        case 3:
            return "fLarge"; // 既定値 28px
        default:
            return "fMiddle";
    }
}
function getDuration(atitude) {
    switch (atitude) {
        case 1:
            return 18_000; // ミリ秒 //10_000で約8秒
        case 2:
            return 12_000;
        case 3:
            return 7_000;
        default:
            return 12_000;
    }
}
function displayInfoUseDemoData(boolean) {
    if (boolean) {
        useDemoDataBtn.disabled = true;
        InfoUseDemoData.textContent = " デモデータを使用中です";
    } else {
        useDemoDataBtn.disabled = false;
        InfoUseDemoData.textContent = "";
    }
}
//設定しているカラーテーマを反映
function setColorTheme(targetValue) {
    if (targetValue === "light") {
        // Light mode
        document.documentElement.style.setProperty(
            "--headerBg",
            "linear-gradient(150deg,rgba(182, 255, 251, 0.795),rgba(250, 237, 181, 0.795) 34%,rgba(255, 239, 170, 0.795) 75%,rgb(182, 255, 251, 0.795))"
        );
        document.documentElement.style.setProperty(
            "--background",
            "radial-gradient(circle, rgb(255, 255, 255), rgb(255, 254, 234))"
        );
        document.documentElement.style.setProperty("--fontColor", "rgb(34, 34, 34)");
        document.documentElement.style.setProperty("--btnfontColor", "rgb(34, 34, 34)");
        document.documentElement.style.setProperty("--itemDitailfontColor", "rgb(0, 0, 0)");
        document.documentElement.style.setProperty("--accentColor", "rgb(255, 173, 97)");
        document.documentElement.style.setProperty("--subColor", "rgb(246, 255, 223)");
        document.documentElement.style.setProperty("--btnDisabled", "rgba(221, 221, 164, 0.788)");
        document.documentElement.style.setProperty("--tinyMessageTextColor", "rgb(246, 255, 223)");
        document.documentElement.style.setProperty("--titleShadow", "4px 0px 3px rgb(240, 240, 240)");
        document.documentElement.style.setProperty("--titlePropTxtColor", "rgb(224, 48, 219)");
        document.documentElement.style.setProperty("--titlePropValueBg", "antiquewhite");
        document.documentElement.style.setProperty("--propColor", "blue");
    } else if (targetValue === "dark") {
        // Dark mode
        document.documentElement.style.setProperty(
            "--headerBg",
            "linear-gradient(150deg, rgb(102, 102, 102), rgba(102, 102, 102) 34%, rgba(102, 102, 102) 75%, rgb(102, 102, 102))"
        );
        document.documentElement.style.setProperty("--background", "radial-gradient(circle, rgb(0, 0, 0), rgb(34, 34, 34))");
        document.documentElement.style.setProperty("--fontColor", "rgb(252, 255, 226)");
        document.documentElement.style.setProperty("--btnfontColor", "rgb(252, 255, 226)");
        document.documentElement.style.setProperty("--itemDitailfontColor", "rgb(0, 0, 0)");
        document.documentElement.style.setProperty("--accentColor", "rgb(255, 173, 97)");
        document.documentElement.style.setProperty("--subColor", "rgb(28, 94, 121)");
        document.documentElement.style.setProperty("--btnDisabled", "rgba(48, 114, 131, 0.788)");
        document.documentElement.style.setProperty("--tinyMessageTextColor", "rgb(252, 255, 226)");
        document.documentElement.style.setProperty("--titleShadow", "4px 0px 3px rgb(126, 119, 184)");
        document.documentElement.style.setProperty("--titlePropTxtColor", "rgb(224, 48, 219)");
        document.documentElement.style.setProperty("--titlePropValueBg", "antiquewhite");
        document.documentElement.style.setProperty("--propColor", "blue");
    } else {
        // Original mode
        document.documentElement.style.setProperty(
            "--headerBg",
            "linear-gradient(150deg, rgba(0, 0, 0, 1), rgba(73, 53, 144, 1) 34%, rgba(75, 43, 100, 1) 75%, rgba(0, 0, 0, 1))"
        );
        document.documentElement.style.setProperty(
            "--background",
            "radial-gradient(circle, rgba(11, 4, 77, 1), rgb(22, 68, 92))"
        );
        document.documentElement.style.setProperty("--fontColor", "rgb(252, 255, 226)");
        document.documentElement.style.setProperty("--btnfontColor", "rgb(34, 34, 34)");
        document.documentElement.style.setProperty("--itemDitailfontColor", "rgb(0, 0, 0)");
        document.documentElement.style.setProperty("--accentColor", "rgb(255, 173, 97)");
        document.documentElement.style.setProperty("--subColor", "rgb(204, 252, 74)");
        document.documentElement.style.setProperty("--btnDisabled", "rgba(150, 187, 50, 0.788)");
        document.documentElement.style.setProperty("--tinyMessageTextColor", "rgb(252, 255, 226)");
        document.documentElement.style.setProperty("--titleShadow", "4px 0px 3px rgb(214, 112, 16)");
        document.documentElement.style.setProperty("--titlePropTxtColor", "rgb(224, 48, 219)");
        document.documentElement.style.setProperty("--titlePropValueBg", "antiquewhite");
        document.documentElement.style.setProperty("--propColor", "blue");
    }
}

//!雨のアニメーション実行
const animate = (options) => {
    let start = performance.now();
    requestAnimationFrame(function animate(time) {
        // timeFraction は 0 から 1
        let timeFraction = (time - start) / options.duration;
        if (timeFraction > 1) timeFraction = 1;
        // 現在のアニメーションの状態を計算
        let progress = options.timing(timeFraction);
        options.draw(progress); // 描画
        if (timeFraction < 1) {
            requestAnimationFrame(animate);
        } else {
            console.log("Anim終了");
            //アニメーションが終わったのでフラグを変更
            myObjArray[options.id] && (myObjArray[options.id].isShown = false); // (trueなら) && (これを実行)
            //1つのsetTimeoutの実行が完了しているのでQ配列の末尾から1つ削除
            timeoutQ.pop();
            options.targetObj.style.visibility = "hidden";
        }
    });
};

//データが完成したら実行されてランダムな間隔でアニメーション実行関数を呼び出す
const doRandomDelay = (count = undefined) => {
    if (count > 0) {
        startAnimationSettiong(); //この先でAnim実行
        let TimeoutID = setTimeout(() => {
            doRandomDelay(count - 1);
        }, Math.floor(Math.random() * oAmeOption)); // 0秒から2秒のランダムな遅延時間
        timeoutQ.unshift(TimeoutID); //配列の先頭に追加
    }
    if (count === undefined) {
        //引数なし->無限に実行
        console.log("引数なし->無限に実行");
        startAnimationSettiong(); //この先でAnim実行
        let TimeoutID = setTimeout(() => {
            doRandomDelay();
        }, Math.floor(Math.random() * oAmeOption)); // (デフォ大雨は2000) 0秒から2秒のランダムな遅延時間
        timeoutQ.unshift(TimeoutID);
    }
};
//アニメーションを実行する
const startAnimation = (targetObj, id, duration) => {
    animate({
        duration: duration, //場外に引き伸ばしている分実際はこの値より少し短い
        timing(timeFraction) {
            return timeFraction;
        },
        draw(progress) {
            targetObj.style.top = to * progress + "px"; //SVG要素の高さ(今は45)分を＋することで完全に流出する(結論いじらない)
        },
        targetObj: targetObj,
        id: id,
    });
};

//アニメーションを実行する準備をする (ランダム間隔で呼ばれる)
const startAnimationSettiong = () => {
    //非表示中のデータからidを取得
    let id = getRandomShownObject();
    //これ以降はアニメーションを実行できる場合に処理される ※idがnullだったらこの関数の処理は終了
    if (id !== null) {
        //リアルタイムのウィンドウ横幅を取得
        let width = window.innerWidth;
        //durarion(アニメーション時間)を取得
        let durarion = getDuration(myObjArray[id].atitude);
        //X軸方向の値を生成して設定する //0(左端) から　(右端-51)　までのランダムな整数
        let xOfset = Math.floor(Math.random() * (width - 200));
        let targetObj = document.getElementById(id); //querySelectorはid数字始まりで使えない
        // console.log(targetObj);
        targetObj.style.transform = `translate(${xOfset}px, -120px)`; //-45以下で。大きいほど開始場外が遠くなる

        //フラグを表示中にする　要素を表示状態にする
        myObjArray[id].isShown = true;
        targetObj.style.visibility = "visible";
        //targetObjを引き渡してアニメーションを実行
        startAnimation(targetObj, id, durarion);
    } else {
        //console.log("※只今全データ表示中なのでアニメーション実行を一回スキップした");
    }
};

//クリップボードにコピー＆コピー完了トースト
const showCopiedMessage = (button) => {
    const message = document.createElement("div");
    message.className = "copied-message";
    message.innerText = "Copied!";
    button.parentElement.appendChild(message);
    message.style.display = "block";
    setTimeout(() => {
        message.remove();
    }, 2000);
};
document.querySelectorAll(".copyButton").forEach((button) => {
    button.addEventListener("click", () => {
        const textToCopy = button.getAttribute("data-text");
        navigator.clipboard
            .writeText(textToCopy)
            .then(() => {
                showCopiedMessage(button);
            })
            .catch((error) => {
                console.error("コピーに失敗しました: ", error);
            });
    });
});

//制作者情報の表示
function openGithub() {
    window.open("https://github.com/ms-20k44r");
}
fa_github.addEventListener("click", openGithub);

const firstEntryAnimAttr = [
    [0, 28_000, 50, 100], //vw50 25 75 62 12 *16-15-14.. //言葉の雨を
    [1, 16_500, 70, 7900], //あなたの言
    [2, 13_000, 25, 3000], //とりあえず雨
    [3, 9_500, 12, 9900], //雨粒は掴む
    [4, 17_000, 30, 11000], //一粒一粒に
]; //@id @duration @xOfset※vwで指定 @Anim開始までのミリ秒
const firstEntryAnim = () => {
    firstEntryAnimAttr.forEach((AnimAtrr, index) => {
        let id = AnimAtrr[0];
        let width = window.innerWidth; //表示領域の横幅取得
        let durarion = AnimAtrr[1];
        let targetObj = document.getElementById(id);
        const elementWidth = targetObj.clientWidth; //テキスト要素の横幅を取得
        const desiredLeft = (AnimAtrr[2] * width) / 100; // ビューポート幅のパーセンテージからピクセルへ変換
        // 要素の中心が指定位置に来るようにする 要素が見切れないように調整
        let leftPosition = desiredLeft - elementWidth / 2;
        if (leftPosition < 0) {
            leftPosition = 0; // 左端に合わせる
        } else if (leftPosition + elementWidth > width) {
            leftPosition = width - elementWidth; // 右端に合わせる
        }
        // translateX(-50%)の影響を無視するために、最終的なleftを計算する
        const finalLeft = leftPosition + elementWidth / 2;
        targetObj.style.left = `${finalLeft}px`;

        if (id === 0) {
            let clientWidth = document.documentElement.clientWidth;
            let clientHeight = document.documentElement.clientHeight;
            targetObj.innerHTML = `さぁ、この ${clientWidth} × ${clientHeight} px の広大なキャンバスに<br>言葉の雨を降らせましょう`;
        }

        myObjArray[id].isShown = true;
        targetObj.style.visibility = "visible";
        let TimeoutID = setTimeout(() => {
            startAnimation(targetObj, id, durarion);
        }, AnimAtrr[3]); // Anim開始までのミリ秒
        timeoutQ.unshift(TimeoutID);
    });
};
const entrySetting = () => {
    titlePropatyList = titlePropatyListEntryData;
    titleSelectIndex = titleSelectValueEntryData;
    orgData = entryData;
    myObjArray = entryData;
    firstEntryAnim();
    //!テスト用に全てのentryデータを初期状態でブックマークに追加
    let data = document.querySelectorAll(".entry");
    data.forEach((item) => {
        bookmarkItemList.push(item.id);
        addBookmarkContents(item.id);
    });
};
