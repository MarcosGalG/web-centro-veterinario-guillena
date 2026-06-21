from django.shortcuts import render

def inicio(request):
    return render(request, 'public/inicio.html')

def servicios(request):
    return render(request, 'public/servicios.html')

def contacto(request):
    return render(request, 'public/contacto.html')