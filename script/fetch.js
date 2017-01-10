// ==UserScript==
// @name        sku
// @namespace   com.opxdo.scripts
// @description 淘宝商品
// @include     https://gainreel.tmall.com/category.htm?*
// @version     1
// @require     file:///D:\Install\lib\jquery-3.1.1.min.js
// @grant       GM_xmlhttpRequest
// ==/UserScript==
// var $ = jQuery.noConflict();

$(function(){

    function GM_xmlhttpRequest(options) {
        options = options || {};
        options.type = (options.type || "GET").toUpperCase();
        options.dataType = options.dataType || "json";
        var params = formatParams(options.data);

        //创建 - 非IE6 - 第一步
        if (window.XMLHttpRequest) {
            var xhr = new XMLHttpRequest();
        } else { //IE6及其以下版本浏览器
            var xhr = new ActiveXObject('Microsoft.XMLHTTP');
        }

        //连接 和 发送 - 第二步
        if (options.type == "GET") {
            xhr.open("GET", options.url + "?" + params, true);
            xhr.send(null);
        } else if (options.type == "POST") {
            xhr.open("POST", options.url, true);
            //设置表单提交时的内容类型
            xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            xhr.send(params);
        }

        //接收 - 第三步
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                var status = xhr.status;
                if (status >= 200 && status < 300) {
                    options.success && options.success(xhr.responseText, xhr.responseXML);
                } else {
                    options.fail && options.fail(status);
                }
            }
        }
    }

    //格式化参数
    function formatParams(data) {
        var arr = [];
        for (var name in data) {
            arr.push(encodeURIComponent(name) + "=" + encodeURIComponent(data[name]));
        }
        arr.push(("v=" + Math.random()).replace(".",""));
        return arr.join("&");
    }


    if(!document.getElementById('rr')){
        $('.J_TItems').prepend('<div id="rrmsg" style="  border:2px solid #000;"><p>正在查找当前页面的宝贝...</p></div>')
    }

    var items = [];
    var itemmap = {};

    if($('#J_ShopSearchResult .J_TItems .pagination').prevAll().find('a[href*="detail.tmall.com/item.htm"]').length==0){
        setTimeout(arguments.callee, 1500);
        return;
    }

    var _items = $('#J_ShopSearchResult .J_TItems .pagination').prevAll().find('.item');
    for (i in _items){
        var item = _items[i];
        var item_dom = $(item);
        var a_dom = item_dom.find('a[href*="detail.tmall.com/item.htm"]')[1];
        // if($(a_dom).find('img').length>0) return;
        if(a_dom){
            var id = a_dom.href.match(/id=(\d+)/)[1];
            var title = a_dom.innerHTML;
        }

        if(!itemmap[id]){
            itemmap[id] = true;
            items.push({
                'id': id,
                'title': title,
                'promotion': parseFloat(item_dom.find('.c-price')[0].innerHTML)
            });
        }
        a_dom = null;
        item_dom = null;
        item = null;
    }

    delete _items;
    delete itemmap;
    var idx = 0;

    $('#rrmsg').append( '<p>当前页面共找到宝贝：<span style="color:red; font-weight:bold;">' + items.length + '</span> 个</p><p>抓取第 <span id="cc" style="font-weight:bold; color:red;"></span> 个宝贝的库存</p>'  );
    $('#rrmsg').append('<p style="font-weight:bold"> ↓ 单击下面的文本框，CTRL+A全选，复制，然后粘贴到excel中。</p>')
    $('#rrmsg').append('<textarea id="rrtxt" style="display:block; clear:both; width:100%; height:200px;"></textarea>')
    $('#rrtxt').append('id\t促销价\t默认价格\t库存\t月销\t标题\n');

    (function(){
        var f = arguments.callee;
        if(idx<items.length){
            $('#cc').html(idx+1);

            var detail_req = GM_xmlhttpRequest({
                method: "GET",
                cache: false,
                url: 'https://detail.tmall.com/item.htm?id=' + items[idx].id + '&r=' + new Date().getTime() + Math.random(),
                success: function(response) {
                    var result = response.match(/TShop\.Setup\(\s*(\{.+\})\s*\)/);
                    if(result.length>1){
                        result = JSON.parse( result[1] );
                        var stock = 0;
                        for(p in result.valItemInfo.skuMap){
                            stock += result.valItemInfo.skuMap[p].stock;
                        }
                    }
                    var ajax_req = GM_xmlhttpRequest({
                        method: "GET",
                        cache: false,
                        headers: {
                            "cookie": "cna=1MDXEPWgjygCATEFA2IZMFxp; thw=cn; ubn=p; ucn=unzbyun; uc3=sg2=AiGa%2B6DXxx36ZeBrH60qrSSfjFDz20FTUYPzR%2B%2Flw8c%3D&nk2=Gdu3e2zK1TH2oNiC&id2=UojUD1bJUR%2F2Pg%3D%3D&vt3=F8dARHYtMpI6VqRms5g%3D&lg2=VT5L2FSpMGV7TQ%3D%3D; uss=W8ydzqZ0SALA1FUwR6b1muhmfIxmd5AUj1Kkrn%2FzVBchxonTCodPDvVUdg%3D%3D; lgc=zsm765732980; tracknick=zsm765732980; t=b1ed6502c238424ac9a5164551e80e92; _cc_=WqG3DMC9EA%3D%3D; tg=0; mt=ci=-1_0; l=Av7-AZwleAl389D5bWFCwL-Yzh5AOcK5; isg=AvLyKfLn_nyL1MJhPuNW5i70Qz41vvYd3vNfV7zLGKWQT5NJpRc1LV6vSVyJ; _tb_token_=1b3RqqvlAGlE; cookie2=f4b0f3c3dbe6a2bd40d1f91bdda68533; v=0",
                            "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.95 Safari/537.36",
                            "referer": "https://detail.tmall.com/item.htm?spm=a1z10.5-b-s.w4011-14776052167.304.qnKzzM&id=534489458543&rn=40c4bfe968424e427322284a3115de42&abbucket=4"
                        },
                        url: result.initApi,
                        success: function(resp) {
                            resp = JSON.parse( resp );
                            var tm_count = 0;
                            if (resp.defaultModel) {
                                if (resp.defaultModel.sellCountDO) {
                                    tm_count = resp.defaultModel.sellCountDO.sellCount;
                                }
                            }
                            setTimeout(f, 1500);
                            $('#rrtxt').append(items[idx].id + '\t' + items[idx].promotion + '\t' + Number(result.detail.defaultItemPrice) + '\t' + stock + '\t' + tm_count + '\t' + items[idx].title + '\n');
                            idx++;
                        },
                        fail: function(resp){
                            idx++;
                            console.log(resp);
                        }
                    });
                    delete ajax_req;
                }
            });
            delete detail_req;
        }else{
            delete items;
            jQuery.removeData(this);
        }
    })(jQuery);

});