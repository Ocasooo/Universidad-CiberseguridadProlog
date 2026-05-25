/* =========================================================
   BASE DE CONOCIMIENTO
   Sistema de Auditoría y Detección de Intrusiones
   SWI-Prolog
========================================================= */

/* =========================================================
   FORMATO LOG
   log(
        Timestamp,
        Usuario,
        IP,
        Estado,
        Hora,
        Puerto,
        Pais
   ).
========================================================= */

/* =========================================================
   ROLES
========================================================= */

rol(admin1, administrador).
rol(admin2, administrador).
rol(admin3, administrador).
rol(user1, usuario).
rol(user2, usuario).
rol(empleado1, empleado).
rol(hacker1, desconocido).
rol(unknown, desconocido).
rol(devops1, desarrollador).
rol(root, administrador).
rol(testuser, testing).
rol(soporte1, soporte).
rol(guest, invitado).

/* =========================================================
   BLACKLIST
========================================================= */

blacklist('45.33.22.1').
blacklist('123.55.77.9').
blacklist('201.44.90.2').

/* =========================================================
   SUBREDES
========================================================= */

subnet('192.168.1.10', '192.168.1.0/24').
subnet('192.168.1.11', '192.168.1.0/24').
subnet('45.33.22.1', '45.33.22.0/24').
subnet('123.55.77.9', '123.55.77.0/24').
subnet('201.44.90.2', '201.44.90.0/24').

/* =========================================================
   REGLAS
========================================================= */

%ip blacklist

ip_blacklist(IP) :-
    blacklist(IP).

%acceso desde ip maliciosa

acceso_malicioso(Usuario) :-
    log(_, Usuario, IP, _, _, _, _),
    ip_blacklist(IP).

%fuera de horario

fuera_horario(Hora) :-
    Hora < 8.

fuera_horario(Hora) :-
    Hora > 18.

%adm fuera de horario

admin_fuera_horario(Usuario) :-
    rol(Usuario, administrador),
    log(_, Usuario, _, exito, Hora, _, _),
    fuera_horario(Hora).

% Predicado recursivo para contar elementos de una lista

mi_length([], 0).

mi_length([_|Resto], N) :-
    mi_length(Resto, N1),
    N is N1 + 1.

%fuerza bruta

fuerza_bruta(Usuario) :-
    findall(
        1,
        log(_, Usuario, _, fallo, _, _, _),
        Lista
    ),
    mi_length(Lista, N),
    N >= 3.

%ataque por ip

ataque_ip(IP) :-
    findall(
        1,
        log(_, _, IP, fallo, _, _, _),
        Lista
    ),
    mi_length(Lista, N),
    N >= 5.

%multiples ip

multiples_ips(Usuario) :-
    log(_, Usuario, IP1, exito, _, _, _),
    log(_, Usuario, IP2, exito, _, _, _),
    IP1 \= IP2.

%acceso exitoso despues de muchos intentos

intrusion_probable(Usuario) :-
    fuerza_bruta(Usuario),
    log(_, Usuario, _, exito, _, _, _).

%acceso simultaneo sospechoso

acceso_simultaneo(Usuario) :-
    log(_, Usuario, IP1, exito, _, _, _),
    log(_, Usuario, IP2, exito, _, _, _),
    subnet(IP1, S1),
    subnet(IP2, S2),
    S1 \= S2.

%puerto sospechoso

puerto_peligroso(3389).
puerto_peligroso(22).

uso_puerto_peligroso(Usuario) :-
    log(_, Usuario, _, _, _, Puerto, _),
    puerto_peligroso(Puerto).

%Acceso desde pais sospechoso

pais_sospechoso(rusia).
pais_sospechoso(china).

acceso_pais_sospechoso(Usuario) :-
    log(_, Usuario, _, _, _, _, Pais),
    pais_sospechoso(Pais).

%Muchos intentos fallidos

muchos_fallos(Usuario) :-
    findall(
        1,
        log(_, Usuario, _, fallo, _, _, _),
        Lista
    ),
    mi_length(Lista, N),
    N >= 5.

%Multiples paises - usuarios que acceden desde al menos 2 paises distintos

multiples_paises(Usuario) :-
    log(_, Usuario, _, _, _, _, Pais1),
    log(_, Usuario, _, _, _, _, Pais2),
    Pais1 \= Pais2.

%Solo fallos - usuarios con intentos fallidos y ningun acceso exitoso

solo_fallos(Usuario) :-
    log(_, Usuario, _, fallo, _, _, _),
    not(log(_, Usuario, _, exito, _, _, _)).

%Ataque coordinado - paises con 5 o mas intentos fallidos

ataque_coordinado(Pais) :-
    findall(
        1,
        log(_, _, _, fallo, _, _, Pais),
        Lista
    ),
    mi_length(Lista, N),
    N >= 5.

%Usuario critico

usuario_critico(Usuario) :-
    intrusion_probable(Usuario),
    multiples_ips(Usuario),
    acceso_malicioso(Usuario).

%Evento critico

evento_critico(Usuario) :-
    admin_fuera_horario(Usuario).

evento_critico(Usuario) :-
    usuario_critico(Usuario).

evento_critico(Usuario) :-
    ataque_ip(_),
    acceso_malicioso(Usuario).

%Usuario sospechoso

usuario_sospechoso(Usuario) :-
    fuerza_bruta(Usuario).

usuario_sospechoso(Usuario) :-
    acceso_pais_sospechoso(Usuario).

usuario_sospechoso(Usuario) :-
    uso_puerto_peligroso(Usuario).


%Generar alertas

alerta(critica, Usuario, 'Fuerza bruta detectada') :-
    fuerza_bruta(Usuario).

alerta(critica, Usuario, 'Intrusion probable') :-
    intrusion_probable(Usuario).

alerta(alta, Usuario, 'Administrador fuera de horario') :-
    admin_fuera_horario(Usuario).

alerta(media, Usuario, 'Acceso desde IP blacklist') :-
    acceso_malicioso(Usuario).

alerta(alta, Usuario, 'Acceso simultaneo sospechoso') :-
    acceso_simultaneo(Usuario).

alerta(media, Usuario, 'Acceso desde multiples paises') :-
    multiples_paises(Usuario).

alerta(alta, Usuario, 'Usuario con solo fallos') :-
    solo_fallos(Usuario).

alerta(critica, Pais, 'Ataque coordinado desde pais') :-
    ataque_coordinado(Pais).

%Reporte

generar_reporte :-
    tell('reporte.txt'),

    write('===================================='), nl,
    write('   CYBERLOGIC AUDIT - REPORTE'), nl,
    write('===================================='), nl, nl,

    write('USUARIOS CRITICOS'), nl,
    write('------------------'), nl,

    forall(
        usuario_critico(U),
        (
            write('Usuario critico detectado: '),
            write(U),
            nl
        )
    ),

    nl,

    write('ALERTAS'), nl,
    write('--------'), nl,

    forall(
        alerta(Nivel, Usuario, Mensaje),
        (
            write('['),
            write(Nivel),
            write('] '),
            write(Usuario),
            write(' -> '),
            write(Mensaje),
            nl
        )
    ),

    told.

% Hechos temporales del CSV
log('2026-05-21 02:10:22', admin1, '45.33.22.1', fallo, 2, 22, rusia).
log('2026-05-21 02:11:10', admin1, '45.33.22.1', fallo, 2, 22, rusia).
log('2026-05-21 02:12:05', admin1, '45.33.22.1', fallo, 2, 22, rusia).
log('2026-05-21 02:13:44', admin1, '45.33.22.1', exito, 2, 22, rusia).
log('2026-05-21 10:12:00', user1, '192.168.1.10', exito, 10, 443, argentina).
log('2026-05-21 10:13:20', user1, '192.168.1.11', exito, 10, 443, argentina).
log('2026-05-21 23:30:10', admin2, '10.0.0.8', exito, 23, 443, argentina).
log('2026-05-21 03:12:55', hacker1, '123.55.77.9', fallo, 3, 22, china).
log('2026-05-21 03:13:55', hacker1, '123.55.77.9', fallo, 3, 22, china).
log('2026-05-21 03:14:55', hacker1, '123.55.77.9', fallo, 3, 22, china).
log('2026-05-21 03:15:55', hacker1, '123.55.77.9', fallo, 3, 22, china).
log('2026-05-21 03:16:55', hacker1, '123.55.77.9', fallo, 3, 22, china).
log('2026-05-21 15:22:01', empleado1, '172.16.0.15', exito, 15, 443, argentina).
log('2026-05-21 04:20:10', unknown, '201.44.90.2', fallo, 4, 3389, brasil).
log('2026-05-21 04:21:10', unknown, '201.44.90.2', fallo, 4, 3389, brasil).
log('2026-05-21 04:22:10', unknown, '201.44.90.2', fallo, 4, 3389, brasil).
log('2026-05-21 09:15:00', devops1, '88.22.11.5', exito, 9, 443, espana).
log('2026-05-21 09:16:10', devops1, '88.22.11.5', exito, 9, 443, espana).
log('2026-05-21 01:05:30', root, '66.66.66.66', fallo, 1, 22, rusia).
log('2026-05-21 01:06:30', root, '66.66.66.66', fallo, 1, 22, rusia).
log('2026-05-21 01:07:30', root, '66.66.66.66', fallo, 1, 22, rusia).
log('2026-05-21 01:08:30', root, '66.66.66.66', fallo, 1, 22, rusia).
log('2026-05-21 01:09:30', root, '66.66.66.66', fallo, 1, 22, rusia).
log('2026-05-21 01:10:30', root, '66.66.66.66', exito, 1, 22, rusia).
log('2026-05-21 12:45:10', user2, '192.168.0.15', exito, 12, 443, argentina).
log('2026-05-21 12:50:40', user2, '192.168.0.15', fallo, 12, 443, argentina).
log('2026-05-21 18:30:00', admin3, '177.22.1.9', exito, 18, 443, argentina).
log('2026-05-21 19:45:00', admin3, '177.22.1.9', exito, 19, 443, argentina).
log('2026-05-21 05:14:22', testuser, '111.90.22.1', fallo, 5, 3389, china).
log('2026-05-21 05:15:22', testuser, '111.90.22.1', fallo, 5, 3389, china).
log('2026-05-21 05:16:22', testuser, '111.90.22.1', fallo, 5, 3389, china).
log('2026-05-21 14:10:00', soporte1, '10.10.10.4', exito, 14, 443, argentina).
log('2026-05-21 14:11:00', soporte1, '10.10.10.8', exito, 14, 443, argentina).
log('2026-05-21 21:00:00', guest, '200.10.55.8', fallo, 21, 22, brasil).
log('2026-05-21 21:01:00', guest, '200.10.55.8', fallo, 21, 22, brasil).
log('2026-05-21 21:02:00', guest, '200.10.55.8', fallo, 21, 22, brasil).
log('2026-05-21 21:03:00', guest, '200.10.55.8', exito, 21, 22, brasil).
