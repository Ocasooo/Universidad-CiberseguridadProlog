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
    rol(user1, usuario).
    rol(user2, usuario).
    rol(user3, usuario).
    rol(empleado1, empleado).
    rol(empleado2, empleado).
    rol(empleado3, empleado).
    rol(hacker1, desconocido).
    rol(hacker2, desconocido).
    rol(unknown, desconocido).

    /* =========================================================
    BLACKLIST
    ========================================================= */

    blacklist('45.33.22.1').
    blacklist('123.55.77.9').
    blacklist('201.44.90.2').
    blacklist('177.45.12.99').
    blacklist('89.210.77.34').
    blacklist('203.11.54.201').
    blacklist('66.66.66.66').
    blacklist('154.90.33.8').
    blacklist('91.222.14.77').

    /* =========================================================
    SUBREDES
    ========================================================= */

    subnet('192.168.1.10', '192.168.1.0/24').
    subnet('192.168.1.11', '192.168.1.0/24').
    subnet('45.33.22.1', '45.33.22.0/24').
    subnet('123.55.77.9', '123.55.77.0/24').
    subnet('201.44.90.2', '201.44.90.0/24').
    subnet('177.45.12.99', '177.45.12.0/24').
    subnet('89.210.77.34', '89.210.77.0/24').
    subnet('203.11.54.201', '203.11.54.0/24').
    subnet('66.66.66.66', '66.66.66.0/24').
    subnet('154.90.33.8', '154.90.33.0/24').
    subnet('91.222.14.77', '91.222.14.0/24').

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

    %fuerza bruta

    fuerza_bruta(Usuario) :-
        findall(
            1,
            log(_, Usuario, _, fallo, _, _, _),
            Lista
        ),
        length(Lista, N),
        N >= 3.

    %ataque por ip

    ataque_ip(IP) :-
        findall(
            1,
            log(_, _, IP, fallo, _, _, _),
            Lista
        ),
        length(Lista, N),
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
        length(Lista, N),
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

    %Reporte
    generar_reporte :-
        tell('reporte.txt'),

        write('===================================='), nl,
        write('          REPORTE COMPLETO          '), nl,
        write('===================================='), nl, nl,

        % =====================================================
        % USUARIOS CRITICOS
        % =====================================================

        write('USUARIOS CRITICOS'), nl,
        write('------------------'), nl,

        (
            setof(
                U,
                usuario_critico(U),
                ListaCriticos
            ),

            forall(
                member(U, ListaCriticos),
                (
                    write('Usuario critico detectado: '),
                    write(U),
                    nl
                )
            )

        ; write('No se detectaron usuarios criticos'), nl
        ),

        nl,

        % =====================================================
        % USUARIOS SOSPECHOSOS
        % =====================================================

        write('USUARIOS SOSPECHOSOS'), nl,
        write('---------------------'), nl,

        (
            setof(
                U,
                usuario_sospechoso(U),
                ListaSospechosos
            ),

            forall(
                member(U, ListaSospechosos),
                (
                    write('Usuario sospechoso: '),
                    write(U),
                    nl
                )
            )

        ; write('No se detectaron usuarios sospechosos'), nl
        ),

        nl,

        % =====================================================
        % ALERTAS
        % =====================================================

        write('ALERTAS GENERADAS'), nl,
        write('------------------'), nl,

        % -----------------------------------------------------
        % Admin fuera de horario
        % -----------------------------------------------------

        forall(
            admin_fuera_horario(U1),
            (
                write('[ALTA] '),
                write(U1),
                write(' -> Administrador fuera de horario'),
                nl
            )
        ),

        % -----------------------------------------------------
        % Fuerza bruta
        % -----------------------------------------------------

        forall(
            fuerza_bruta(U2),
            (
                write('[CRITICA] '),
                write(U2),
                write(' -> Fuerza bruta detectada'),
                nl
            )
        ),

        % -----------------------------------------------------
        % Acceso malicioso
        % -----------------------------------------------------

        forall(
            acceso_malicioso(U3),
            (
                write('[CRITICA] '),
                write(U3),
                write(' -> Acceso desde IP blacklist'),
                nl
            )
        ),

        % -----------------------------------------------------
        % Multiples IPs
        % -----------------------------------------------------

        forall(
            multiples_ips(U4),
            (
                write('[MEDIA] '),
                write(U4),
                write(' -> Multiples IPs detectadas'),
                nl
            )
        ),

        % -----------------------------------------------------
        % Acceso simultaneo
        % -----------------------------------------------------

        forall(
            acceso_simultaneo(U5),
            (
                write('[ALTA] '),
                write(U5),
                write(' -> Acceso simultaneo sospechoso'),
                nl
            )
        ),

        % -----------------------------------------------------
        % Intrusion probable
        % -----------------------------------------------------

        forall(
            intrusion_probable(U6),
            (
                write('[CRITICA] '),
                write(U6),
                write(' -> Intrusion probable'),
                nl
            )
        ),

        % -----------------------------------------------------
        % Evento critico
        % -----------------------------------------------------

        forall(
            evento_critico(U7),
            (
                write('[CRITICA] '),
                write(U7),
                write(' -> Evento critico detectado'),
                nl
            )
        ),

        % -----------------------------------------------------
        % Ataque por IP
        % -----------------------------------------------------

        forall(
            ataque_ip(IP1),
            (
                write('[ALTA] '),
                write(IP1),
                write(' -> Ataque por IP detectado'),
                nl
            )
        ),

        % -----------------------------------------------------
        % Multiples paises
        % -----------------------------------------------------

        forall(
            multiples_paises(U8),
            (
                write('[MEDIA] '),
                write(U8),
                write(' -> Accesos desde multiples paises'),
                nl
            )
        ),

        % -----------------------------------------------------
        % Solo fallos
        % -----------------------------------------------------

        forall(
            solo_fallos(U9),
            (
                write('[ALTA] '),
                write(U9),
                write(' -> Usuario con solo accesos fallidos'),
                nl
            )
        ),

        % -----------------------------------------------------
        % Ataque coordinado
        % -----------------------------------------------------

        forall(
            ataque_coordinado(Pais),
            (
                write('[CRITICA] '),
                write(Pais),
                write(' -> Ataque coordinado detectado'),
                nl
            )
        ),

        nl,

        % =====================================================
        % ESTADISTICAS
        % =====================================================

        write('ESTADISTICAS'), nl,
        write('-------------'), nl,

        findall(
            1,
            log(_, _, _, _, _, _, _),
            Logs
        ),

        length(Logs, TotalLogs),

        write('Total de logs: '),
        write(TotalLogs),
        nl,

        findall(
            1,
            fuerza_bruta(_),
            FuerzaBruta
        ),

        length(FuerzaBruta, TotalFB),

        write('Usuarios con fuerza bruta: '),
        write(TotalFB),
        nl,

        findall(
            1,
            usuario_critico(_),
            Criticos
        ),

        length(Criticos, TotalCriticos),

        write('Usuarios criticos: '),
        write(TotalCriticos),
        nl,

        nl,
        write('===================================='), nl,
        write('      FIN DEL REPORTE'),
        nl,
        write('===================================='), nl,

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
