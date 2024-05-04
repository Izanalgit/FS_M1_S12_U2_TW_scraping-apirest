const express = require ("express");
const cheerio = require ("cheerio");
const axios = require("axios");
const fs = require("node:fs");

const app = express();
app.use(express.urlencoded({extended:true}));

const url = 'https://elpais.com/ultimas-noticias/';

let noticias = [];

function Noticia (titulo,imagen,descripcion,enlace){
    this.titulo = titulo;
    this.imagen = imagen;
    this.descripcion = descripcion;
    this.enlace = enlace;
};


app.use(express.json());

app.get("/",(req,res)=>{

    axios.get(url).then((resp)=>{

        const htmlDom = resp.data;
        const $ = cheerio.load(htmlDom);


        $('article').map((ind,elm)=>{
            const titulo = $(elm).find('h2').text();
            const imagen = $(elm).find('img').attr('src');
            const descrp = $(elm).find('p').text();
            const enlace = $(elm).find('a').attr('href');


            const articulo = new Noticia(titulo,imagen,descrp,enlace);
            
            noticias.push(articulo);
            
            res.send(
            `
                <h1>SCRAPING CRUD</h1>
                <a href="/noticias">NOTICIAS</a>
            `)
        })

    })
    .then(()=>guardarDatos())
    .catch((err)=>console.log("Lo Pais se cae por : ",err))  
})

app.get('/noticias',(req,res)=>{

    if(noticias.length=0 || !noticias)res.redirect("/");
    leerDatos();

    res.json(noticias)
})

app.get('/noticias/:noticia',(req,res)=>{

    if(noticias.length=0 || !noticias)res.redirect("/");
    leerDatos();

    const notTitle = req.params.noticia;

    noticias.forEach((noticia,index)=>{
        if(noticia.titulo===notTitle||index==notTitle)res.json(noticia)
    })

    res.json(noticias)
})

app.post('/noticias',(req,res)=>{

    if(noticias.length=0 || !noticias)res.redirect("/");
    leerDatos();

    const titulo = req.body.titulo;
    const imagen = req.body.imagen;
    const descrp = req.body.descripcion;
    const enlace = req.body.enlace


    const articulo = new Noticia(titulo,imagen,descrp,enlace);
    
    noticias.push(articulo);

    guardarDatos();

    res.redirect("/");
})

app.put('/noticias/:noticia',(req,res)=>{

    if(noticias.length=0 || !noticias)res.redirect("/");
    leerDatos();
    
    let notIndx;
    if(typeof req.params.noticia == "number")notIndx=req.params.noticia
    else notIndx = noticias.findIndex((noticia)=>noticia=req.params.noticia)

    noticias[notIndx] = {
        titulo:req.body.titulo,
        imagen:req.body.imagen,
        descrp:req.body.descripcion,
        enlace:req.body.enlace,
    }
    

    guardarDatos();

    res.redirect("/");
})

app.delete('/noticias/:noticia',(req,res)=>{

    if(noticias.length=0 || !noticias)res.redirect("/");
    leerDatos();

    let notIndx;
    if(typeof req.params.noticia == "number")notIndx=req.params.noticia
    else notIndx = noticias.findIndex((noticia)=>noticia=req.params.noticia)

    delete noticias[notIndx];
    noticias.slice(notIndx,1);
    
    guardarDatos();

    res.redirect("/");
})


app.listen(3000,()=>{
    console.log("Server on http://localhost:3000");
})


function leerDatos() {
  try {
    const data = fs.readFileSync('noticias.json', 'utf-8');
    noticias = JSON.parse(data);
  } catch (error) {
    console.error('Error al leer el archivo noticias.json:', error.message);
  }
}

function guardarDatos() {
  fs.writeFileSync('noticias.json', JSON.stringify(noticias, null, 2));
}