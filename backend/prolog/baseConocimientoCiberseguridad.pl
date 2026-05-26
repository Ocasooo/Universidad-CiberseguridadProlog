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

    %Multiples paises

    multiples_paises(Usuario) :-
        log(_, Usuario, _, _, _, _, Pais1),
        log(_, Usuario, _, _, _, _, Pais2),
        Pais1 \= Pais2.

    %Solo Fallos

    solo_fallos(Usuario) :-
        log(_, Usuario, _, fallo, _, _, _),
        \+ log(_, Usuario, _, exito, _, _, _).

    %Ataque coordinado

    ataque_coordinado(Pais) :-
        findall(
            Usuario,
            (
                log(_, Usuario, _, fallo, _, _, Pais),
                rol(Usuario, desconocido)
            ),
            Lista
        ),
        length(Lista, N),
        N >= 3.


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
                    once(log(TS, U, IP, Estado, Hora, Puerto, Pais)),
                    rol(U, Rol),

                    write('Usuario: '), write(U),
                    write(' | Rol: '), write(Rol),
                    write(' | IP: '), write(IP),
                    write(' | Pais: '), write(Pais),
                    write(' | Hora: '), write(Hora),
                    write(' | Estado: '), write(Estado),
                    write(' | Puerto: '), write(Puerto),
                    write(' | Timestamp: '), write(TS),
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
                    once(log(TS2, U, IP2, Estado2, Hora2, Puerto2, Pais2)),
                    rol(U, Rol2),

                    write('Usuario: '), write(U),
                    write(' | Rol: '), write(Rol2),
                    write(' | IP: '), write(IP2),
                    write(' | Pais: '), write(Pais2),
                    write(' | Hora: '), write(Hora2),
                    write(' | Estado: '), write(Estado2),
                    write(' | Puerto: '), write(Puerto2),
                    write(' | Timestamp: '), write(TS2),
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
                once(log(TS1, U1, IP1, _, Hora1, Puerto1, Pais1)),

                write('[ALTA] Usuario: '), write(U1),
                write(' | IP: '), write(IP1),
                write(' | Pais: '), write(Pais1),
                write(' | Hora: '), write(Hora1),
                write(' | Puerto: '), write(Puerto1),
                write(' | Timestamp: '), write(TS1),
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
                once(log(TS2, U2, IP2, _, Hora2, Puerto2, Pais2)),

                findall(
                    1,
                    log(_, U2, _, fallo, _, _, _),
                    Fallos
                ),

                length(Fallos, CantFallos),

                write('[CRITICA] Usuario: '), write(U2),
                write(' | IP: '), write(IP2),
                write(' | Pais: '), write(Pais2),
                write(' | Hora: '), write(Hora2),
                write(' | Puerto: '), write(Puerto2),
                write(' | Fallos: '), write(CantFallos),
                write(' | Timestamp: '), write(TS2),
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
                once(log(TS3, U3, IP3, _, Hora3, Puerto3, Pais3)),

                write('[CRITICA] Usuario: '), write(U3),
                write(' | IP blacklist: '), write(IP3),
                write(' | Pais: '), write(Pais3),
                write(' | Hora: '), write(Hora3),
                write(' | Puerto: '), write(Puerto3),
                write(' | Timestamp: '), write(TS3),
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
                once(log(TS4, U4, IP4, _, Hora4, Puerto4, Pais4)),

                write('[MEDIA] Usuario: '), write(U4),
                write(' | IP: '), write(IP4),
                write(' | Pais: '), write(Pais4),
                write(' | Hora: '), write(Hora4),
                write(' | Puerto: '), write(Puerto4),
                write(' | Timestamp: '), write(TS4),
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
                once(log(TS5, U5, IP5, _, Hora5, Puerto5, Pais5)),

                write('[ALTA] Usuario: '), write(U5),
                write(' | IP: '), write(IP5),
                write(' | Pais: '), write(Pais5),
                write(' | Hora: '), write(Hora5),
                write(' | Puerto: '), write(Puerto5),
                write(' | Timestamp: '), write(TS5),
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
                once(log(TS6, U6, IP6, _, Hora6, Puerto6, Pais6)),

                write('[CRITICA] Usuario: '), write(U6),
                write(' | IP: '), write(IP6),
                write(' | Pais: '), write(Pais6),
                write(' | Hora: '), write(Hora6),
                write(' | Puerto: '), write(Puerto6),
                write(' | Timestamp: '), write(TS6),
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
                once(log(TS7, U7, IP7, _, Hora7, Puerto7, Pais7)),

                write('[CRITICA] Usuario: '), write(U7),
                write(' | IP: '), write(IP7),
                write(' | Pais: '), write(Pais7),
                write(' | Hora: '), write(Hora7),
                write(' | Puerto: '), write(Puerto7),
                write(' | Timestamp: '), write(TS7),
                write(' -> Evento critico detectado'),
                nl
            )
        ),

        % -----------------------------------------------------
        % Ataque por IP
        % -----------------------------------------------------

        forall(
            ataque_ip(IP8),
            (
                once(log(TS8, U8, IP8, _, Hora8, Puerto8, Pais8)),

                write('[ALTA] Usuario: '), write(U8),
                write(' | IP: '), write(IP8),
                write(' | Pais: '), write(Pais8),
                write(' | Hora: '), write(Hora8),
                write(' | Puerto: '), write(Puerto8),
                write(' | Timestamp: '), write(TS8),
                write(' -> Ataque por IP detectado'),
                nl
            )
        ),

        % -----------------------------------------------------
        % Multiples paises
        % -----------------------------------------------------

        forall(
            multiples_paises(U9),
            (
                once(log(TS9, U9, IP9, _, Hora9, Puerto9, Pais9)),

                write('[MEDIA] Usuario: '), write(U9),
                write(' | IP: '), write(IP9),
                write(' | Pais: '), write(Pais9),
                write(' | Hora: '), write(Hora9),
                write(' | Puerto: '), write(Puerto9),
                write(' | Timestamp: '), write(TS9),
                write(' -> Accesos desde multiples paises'),
                nl
            )
        ),

        % -----------------------------------------------------
        % Solo fallos
        % -----------------------------------------------------

        forall(
            solo_fallos(U10),
            (
                once(log(TS10, U10, IP10, _, Hora10, Puerto10, Pais10)),

                findall(
                    1,
                    log(_, U10, _, fallo, _, _, _),
                    ListaFallos
                ),

                length(ListaFallos, CantidadFallos),

                write('[ALTA] Usuario: '), write(U10),
                write(' | IP: '), write(IP10),
                write(' | Pais: '), write(Pais10),
                write(' | Hora: '), write(Hora10),
                write(' | Puerto: '), write(Puerto10),
                write(' | Fallos: '), write(CantidadFallos),
                write(' | Timestamp: '), write(TS10),
                write(' -> Usuario con solo accesos fallidos'),
                nl
            )
        ),

        % -----------------------------------------------------
        % Ataque coordinado
        % -----------------------------------------------------

        forall(
            ataque_coordinado(Pais11),
            (
                once(log(TS11, U11, IP11, _, Hora11, Puerto11, Pais11)),

                write('[CRITICA] Usuario: '), write(U11),
                write(' | IP: '), write(IP11),
                write(' | Pais: '), write(Pais11),
                write(' | Hora: '), write(Hora11),
                write(' | Puerto: '), write(Puerto11),
                write(' | Timestamp: '), write(TS11),
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
            log(_, _, _, exito, _, _, _),
            Exitos
        ),

        length(Exitos, TotalExitos),

        write('Accesos exitosos: '),
        write(TotalExitos),
        nl,

        findall(
            1,
            log(_, _, _, fallo, _, _, _),
            Fallos
        ),

        length(Fallos, TotalFallos),

        write('Accesos fallidos: '),
        write(TotalFallos),
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

        findall(
            1,
            admin_fuera_horario(_),
            AdminsFH
        ),

        length(AdminsFH, TotalAdminsFH),

        write('Administradores fuera de horario: '),
        write(TotalAdminsFH),
        nl,

        findall(
            1,
            multiples_paises(_),
            MultiPais
        ),

        length(MultiPais, TotalMultiPais),

        write('Usuarios con accesos desde multiples paises: '),
        write(TotalMultiPais),
        nl,

        nl,
        write('===================================='), nl,
        write('      FIN DEL REPORTE'),
        nl,
        write('===================================='), nl,

        told.