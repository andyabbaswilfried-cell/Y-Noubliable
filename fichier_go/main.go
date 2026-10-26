package main

import (
	"fmt"
	"os"
	"github.com/joho/godotenv"
	"net/http"
	"log"
	"github.com/markbates/goth"
	"github.com/markbates/goth/gothic"
	"github.com/markbates/goth/providers/google"

)



func main(){
	fileServer:= http.FileServer(http.Dir("./static"))
	http.Handle("/",fileServer)
	http.HandleFunc("/form",formHandler)
	http.HandleFunc("/hello",helloHandler)
}

func looging()
