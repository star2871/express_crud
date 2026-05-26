const http = require('http');
const express = require('express');
const { throws } = require('assert');
const app = express();

app.set("view engine", "ejs"); // 확장자(접미사는 사용할때 생략)
app.set("views", __dirname + "/views"); // 템플릿 파일 위치

app.use('/', express.static("public"));
app.use(express.json());
app.use(express.urlencoded({extended:false}));

app.get("/", function(req, res) {
    // 루트 경로 요청 시 /list로 리다이렉트
    res.redirect("/list");
});

app.get("/hello", function(req, res) {
    console.log("/ 요청 들어옴.")
    res.end("<h1>Hello world</h1>");
});

// 임시 데이터 리스트
var carList = [
    {_id: 1, name:"Sonata", price:2000, company:"HYUNDAI", year:2020},
    {_id: 2, name:"Grandeur", price:3000, company:"HYUNDAI", year:2022},
    {_id: 3, name:"S80", price:5000, company:"VOLVO", year:2021},
]
var sequence = 4;

// view engine: ejs를 설치 하고 view engine 셋팅
app.get("/list", function(req,res) {
    // 쿼리에서 keyword와 searchType을 받아옵니다. searchType의 기본값은 'name'입니다.
    const { keyword, searchType = 'name' } = req.query;
    let listToRender = carList;

    if (keyword && keyword.trim() !== '') {
        const lowerKeyword = keyword.toLowerCase();
        listToRender = carList.filter(function(car) {
            // searchType에 따라 검색할 필드를 동적으로 선택합니다.
            // 연식(year)처럼 숫자 타입도 검색 가능하도록 String()으로 변환합니다.
            const targetField = car[searchType] ? String(car[searchType]).toLowerCase() : '';
            return targetField.includes(lowerKeyword);
        });
    }

    // 파일명, 객체, 콜백
    res.render("list", {name:"hong", carList: listToRender, keyword: keyword || '', searchType: searchType});
});

app.get("/detail/:_id", function(req, res) {
    var _id = Number(req.params._id);
    var car = carList.find(function(item) {
        return item._id == _id;
    });

    if(car) {
        req.app.render("detail", { car: car }, function(err, html) {
            if(err) {
                throw err;
            }
            res.end(html);
        });
    } else {
        res.status(404).send("Car not found!");
    }
});

app.get("/input", function(req, res) {
    req.app.render("input", {}, function(err, html) {
        if(err) {
            throw err;
            return;
        }
        res.end(html);
    });
});

app.post("/input", function(req, res) {
    var car = req.body;
    car._id = sequence++;
    console.log(car);
    carList.push(car);
    res.redirect("/list");
})

app.get("/delete", function(req, res) {
    console.log(req.query._id);
    // 삭제 처리 후 list로 리다이렉트
    var _id = Number(req.query._id);
    var idx = carList.findIndex(function(car) {
        return car._id == _id;
    });
    if(idx != -1) {
        carList.splice(idx, 1);
    }
    res.redirect("/list");
});

app.get("/update/:_id", function(req, res) {
    var _id = Number(req.params._id);
    var car = carList.find(function(item) {
        return item._id == _id;
    });
    if(car) {
        req.app.render("update", { car: car }, function(err, html) {
            if(err) {
                throw err;
                return;
            }
            res.end(html);
        });
    } else {
        res.status(404).send("Car not found!");
    }
});

app.post("/update", function(req, res) {
    var carData = req.body;
    var _id = Number(carData._id);
    var idx = carList.findIndex(function(item) {
        return item._id == _id;
    });
    if(idx != -1) {
        carList[idx].name = carData.name;
        carList[idx].price = Number(carData.price);
        carList[idx].company = carData.company;
        carList[idx].year = Number(carData.year);
    }
    res.redirect("/list");
});

const server = http.createServer(app);
server.listen(3000, function() {
    console.log("http://localhost:3000");
});