!include x64.nsh
!include LogicLib.nsh

!macro preInit

    ${If} ${RunningX64}
        SetRegView 64
    ${EndIf}

    ; Always set the default install location to Program Files\Flowlence Code
    ${If} ${RunningX64}
        WriteRegExpandStr HKLM "${INSTALL_REGISTRY_KEY}" InstallLocation "$PROGRAMFILES64\Flowlence Code"
        WriteRegExpandStr HKCU "${INSTALL_REGISTRY_KEY}" InstallLocation "$PROGRAMFILES64\Flowlence Code"
    ${Else}
        WriteRegExpandStr HKLM "${INSTALL_REGISTRY_KEY}" InstallLocation "$PROGRAMFILES\Flowlence Code"
        WriteRegExpandStr HKCU "${INSTALL_REGISTRY_KEY}" InstallLocation "$PROGRAMFILES\Flowlence Code"
    ${EndIf}

    ${If} ${RunningX64}
        SetRegView LastUsed
    ${EndIf}

!macroend

!macro customUnInstall

    ${If} ${RunningX64}
        SetRegView 64
    ${EndIf}

    DeleteRegKey HKLM "${INSTALL_REGISTRY_KEY}"
    DeleteRegKey HKCU "${INSTALL_REGISTRY_KEY}"

    ${If} ${RunningX64}
        SetRegView LastUsed
    ${EndIf}

 !macroend
