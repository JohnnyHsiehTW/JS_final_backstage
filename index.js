// 取得訂單列表
// https://livejs-api.hexschool.io/api/livejs/v1/admin/johnny5563/orders
const baseUrl = "https://livejs-api.hexschool.io/api/livejs/v1/admin/";
const apiPath = "johnny5563";

const token = "tV4CvgRMVrM2VUbukbBWuiMQYy93";
const headers = {
  headers: {
    authorization: token,
  },
};

// 訂單列表-初始化渲染
const orderList = document.querySelector(".orderPage-table-content");
axios
  .get(`${baseUrl}${apiPath}/orders`, headers)
  .then((res) => {
    orderData = res.data.orders;
    renderList();
    renderCart(orderData);
  })
  .catch((err) => console.log(err.message));
function renderList() {
  orderList.innerHTML = orderData
    .map((item) => {
      return `<tr>
                <td>${item.id}</td>
                <td>
                  <p>${item.user.name}</p>
                  <p>${item.user.tel}</p>
                </td>
                <td>${item.user.address}</td>
                <td>${item.user.email}</td>
                <td>
                  <p>${item.products.map((item) => {
                    return item.title;
                  })}</p>
                </td>
                <td>${new Date(item.createdAt * 1000).toLocaleDateString(
                  "zh-TW"
                )}</td>
                <td class="orderStatus">
                  <a href="#">${item.paid ? "已處理" : "未處理"}</a>
                </td>
                <td>
                  <input data-id="${
                    item.id
                  }" type="button" class="delSingleOrder-Btn" value="刪除" />
                </td>
              </tr>`;
    })
    .join("");
}

// 清除全部訂單
const deleteOrdersBtn = document.querySelector(".discardAllBtn");
deleteOrdersBtn.addEventListener("click", deleteOrders);

function deleteOrders(e) {
  e.preventDefault();
  axios
    .delete(`${baseUrl}${apiPath}/orders`, headers)
    .then((res) => {
      updateList();
      renderCart();
    })
    .catch((err) => console.log(err));
}

// 刪除單一訂單
orderList.addEventListener("click", delSingleOrder);
function delSingleOrder(e) {
  e.preventDefault();
  if (e.target.className === "delSingleOrder-Btn") {
    axios
      .delete(`${baseUrl}${apiPath}/orders/${e.target.dataset.id}`, headers)
      .then((res) => {
        updateList();
        renderCart();
      })
      .catch((err) => console.log(err));
  }
}

// 更新訂單列表
function updateList() {
  axios
    .get(`${baseUrl}${apiPath}/orders`, headers)
    .then((res) => {
      orderData = res.data.orders;
      renderList();
      renderCart(orderData);
    })
    .catch((err) => console.log(err.message));
}

// 產生圖表
// Chart Data (unfinished)
// 全品項營收比重
// sellData = 取得所有訂單 >> 同品項金額加總(需重組資料，取出) >> 大至小排序
// sellData = [
//    [topSell title, Sum],
//    [secondSell title, Sum],
//    [thirdSell title, Sum],
//    [其他, Sum]
//  ]
// Top >> sellData 取第0筆資料、顯示金額
// Second >> sellData 取第1筆資料、顯示金額
// third >> sellData 取第2筆資料、顯示金額
// others >> sellData 排除前三筆資料、加總金額

function renderCart(data) {
  console.log("renderCart", data);
  let total = {};
  data.forEach((item) => {
    item.products.forEach((productItem) => {
      if (total[productItem.title] === undefined) {
        total[productItem.title] = productItem.price * productItem.quantity;
      } else {
        total[productItem.title] += productItem.price * productItem.quantity;
      }
    });
  });
  console.log("renderCart", total);

  let originArray = Object.keys(total);
  console.log(originArray);
  let sortArray = [];
  originArray.forEach((item) => {
    let ary = [];
    ary.push(item);
    ary.push(total[item]);
    sortArray.push(ary);
  });
  sortArray.sort((a, b) => {
    return b[1] - a[1];
  });

  if (sortArray.length > 3) {
    let otherTotal = 0;
    sortArray.forEach((item, index) => {
      if (index > 2) {
        otherTotal += sortArray[index][1];
      }
    });
    sortArray.splice(3, sortArray.length - 1);
    sortArray.push(["其他", otherTotal]);
  }
  console.log("sortArray", sortArray);

  // C3.js
  let chart = c3.generate({
    bindto: "#chart", // HTML 元素綁定
    data: {
      type: "pie",
      columns: sortArray,
    },
  });
}
