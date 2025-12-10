// src/layouts/Sidebar.tsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Collapse,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material";

import DashboardIcon from "@mui/icons-material/SpaceDashboard";
import InventoryIcon from "@mui/icons-material/Inventory2";
import PersonIcon from "@mui/icons-material/Person";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import ListAltIcon from "@mui/icons-material/ListAlt";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import InfoIcon from "@mui/icons-material/Info";
import RouteIcon from "@mui/icons-material/AltRoute";
import SettingsIcon from "@mui/icons-material/Settings";

import { NavLink, useLocation, useNavigate } from "react-router-dom";

const drawerWidth = 240;

type SubItem = {
  key: string;
  label: string;
  to: string;
  icon?: React.ReactNode;
};

type NavGroup = {
  key: string;
  label: string;
  icon?: React.ReactNode;
  to?: string;
  children?: SubItem[];
};

const NAV: NavGroup[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    icon: <DashboardIcon />,
    to: "/dashboard",
  },
  {
    key: "inventory",
    label: "Inventory",
    icon: <InventoryIcon />,
    to: "/inventory",
    children: [
      { key: "inv-list", label: "List All", to: "/inventory", icon: <ListAltIcon /> },
      { key: "inv-details", label: "Inventory Details", to: "/inventory/details", icon: <InfoIcon /> },
    ],
  },
  {
    key: "consumers",
    label: "Consumers",
    icon: <PersonIcon />,
    to: "/consumers/list",
    children: [
      { key: "cons-list", label: "List All", to: "/consumers/list", icon: <ListAltIcon /> },
      { key: "cons-kyc", label: "KYC Pending", to: "/consumers/kyc", icon: <PendingActionsIcon /> },
      { key: "cons-detail", label: "Consumer Details", to: "/consumers/details", icon: <InfoIcon /> },
    ],
  },
  {
    key: "routes",
    label: "Routes",
    icon: <RouteIcon />,
    to: "/routes",
    children: [
      { key: "routes-list", label: "List All", to: "/routes/", icon: <ListAltIcon /> },
      { key: "routes-active", label: "Active Routes", to: "/routes/active", icon: <ListAltIcon /> },
      { key: "routes-mapping", label: "Route Mapping", to: "/routes/mapping", icon: <InfoIcon /> },
    ],
  },
  {
    key: "settings",
    label: "Settings",
    icon: <SettingsIcon />,
    to: "/settings",
  },
];

export default function Sidebar() {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [openMap, setOpenMap] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    NAV.forEach((g) => {
      initial[g.key] = false;
    });
    return initial;
  });

  useEffect(() => {
    const path = location.pathname;
    const newOpen: Record<string, boolean> = {};
    NAV.forEach((g) => {
      const shouldOpen =
        (g.children && g.children.some((c) => path.startsWith(c.to))) ||
        (!!g.to && path.startsWith(g.to) && g.children?.length);
      newOpen[g.key] = Boolean(shouldOpen);
    });
    setOpenMap((prev) => ({ ...prev, ...newOpen }));
  }, [location.pathname]);

  const handleToggle = (group: NavGroup) => {
    setOpenMap((prev) => ({ ...prev, [group.key]: !prev[group.key] }));
    if (group.to) navigate(group.to);
  };

  const isActive = (to: string) =>
    location.pathname === to || location.pathname.startsWith(to + "/");

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          bgcolor: "primary.main",
          color: "white",
          border: "none",
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          p: 0,
        },
      }}
    >
      {/* Branding */}
      <Box
        sx={{
          height: 120,
          display: "flex",
          alignItems: "center",
          gap: 2,
          px: 2,
          borderBottom: "1px solid rgba(255,255,255,0.12)",
        }}
      >
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 2,
            bgcolor: "secondary.main",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <InventoryIcon sx={{ color: "black", fontSize: 28 }} />
        </Box>

        <Box>
          <Typography variant="h6" fontWeight={700}>
            Lalitha Gas
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.85 }}>
            Agency
          </Typography>
        </Box>
      </Box>

      {/* Navigation */}
      <Box sx={{ flexGrow: 1, overflowY: "auto" }}>
        <List disablePadding>
          {NAV.map((group) => {
            const groupOpen = Boolean(openMap[group.key]);
            const activeParent =
              (group.to && isActive(group.to)) ||
              (group.children && group.children.some((c) => isActive(c.to)));

            return (
              <Box key={group.key}>
                {/* Parent item */}
                <ListItemButton
                  onClick={() => handleToggle(group)}
                  sx={{
                    px: 2,
                    py: 1.25,
                    alignItems: "center",
                    gap: 2,

                    // ⭐ New Active Parent Styling (GREEN)
                    backgroundColor: activeParent
                      ? alpha(theme.palette.success.main, 0.12)
                      : "transparent",

                    borderLeft: activeParent
                      ? `4px solid ${theme.palette.success.main}`
                      : "4px solid transparent",

                    color: activeParent ? theme.palette.success.main : "white",

                    "& .MuiListItemIcon-root": {
                      color: activeParent ? theme.palette.success.main : "white",
                    },

                    "&:hover": {
                      backgroundColor: alpha(
                        theme.palette.success.main,
                        0.18
                      ),
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    {group.icon}
                  </ListItemIcon>

                  <ListItemText
                    primary={group.label}
                    primaryTypographyProps={{ fontWeight: 600 }}
                  />

                  {group.children?.length ? (
                    groupOpen ? (
                      <ExpandLess />
                    ) : (
                      <ExpandMore />
                    )
                  ) : null}
                </ListItemButton>

                {/* Children */}
                {group.children?.length ? (
                  <Collapse in={groupOpen} timeout="auto" unmountOnExit>
                    <List disablePadding>
                      {group.children.map((child) => {
                        const childActive = isActive(child.to);

                        return (
                          <ListItemButton
                            key={child.key}
                            component={NavLink}
                            to={child.to}
                            sx={{
                              pl: 6,
                              py: 1,

                              // ⭐ New Active Child Styling (GREEN)
                              color: childActive
                                ? theme.palette.success.main
                                : "rgba(255,255,255,0.92)",

                              backgroundColor: childActive
                                ? alpha(theme.palette.success.main, 0.12)
                                : "transparent",

                              borderLeft: childActive
                                ? `4px solid ${theme.palette.success.main}`
                                : "4px solid transparent",

                              "& .MuiListItemIcon-root": {
                                color: childActive
                                  ? theme.palette.success.main
                                  : "rgba(255,255,255,0.9)",
                              },

                              "&:hover": {
                                backgroundColor: alpha(
                                  theme.palette.success.main,
                                  0.18
                                ),
                                color: theme.palette.success.main,
                                "& .MuiListItemIcon-root": {
                                  color: theme.palette.success.main,
                                },
                              },
                            }}
                          >
                            <ListItemIcon sx={{ minWidth: 36 }}>
                              {child.icon}
                            </ListItemIcon>

                            <ListItemText
                              primary={child.label}
                              primaryTypographyProps={{
                                fontSize: 14,
                                fontWeight: 600,
                              }}
                            />
                          </ListItemButton>
                        );
                      })}
                    </List>
                  </Collapse>
                ) : null}
              </Box>
            );
          })}
        </List>
      </Box>

      {/* Version Footer */}
      <Box sx={{ p: 2, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.7)" }}>
          v1.0.0
        </Typography>
      </Box>
    </Drawer>
  );
}




// // src/layouts/Sidebar.tsx
// import React, { useEffect, useState } from "react";
// import {
//   Box,
//   Drawer,
//   List,
//   ListItemButton,
//   ListItemIcon,
//   ListItemText,
//   Typography,
//   Collapse,
//   useTheme,
// } from "@mui/material";

// import { alpha } from "@mui/material";


// import DashboardIcon from "@mui/icons-material/SpaceDashboard";
// import InventoryIcon from "@mui/icons-material/Inventory2";
// import PersonIcon from "@mui/icons-material/Person";
// import ExpandLess from "@mui/icons-material/ExpandLess";
// import ExpandMore from "@mui/icons-material/ExpandMore";
// import ListAltIcon from "@mui/icons-material/ListAlt";
// import PendingActionsIcon from "@mui/icons-material/PendingActions";
// import InfoIcon from "@mui/icons-material/Info";
// import RouteIcon from "@mui/icons-material/AltRoute";
// import SettingsIcon from "@mui/icons-material/Settings";

// import { NavLink, useLocation, useNavigate } from "react-router-dom";

// const drawerWidth = 240;

// type SubItem = {
//   key: string;
//   label: string;
//   to: string;
//   icon?: React.ReactNode;
// };

// type NavGroup = {
//   key: string;
//   label: string;
//   icon?: React.ReactNode;
//   to?: string; // parent default url (for Q1:B behavior)
//   children?: SubItem[];
// };

// const NAV: NavGroup[] = [
//   {
//     key: "dashboard",
//     label: "Dashboard",
//     icon: <DashboardIcon />,
//     to: "/dashboard",
//   },
//   {
//     key: "inventory",
//     label: "Inventory",
//     icon: <InventoryIcon />,
//     to: "/inventory",
//     children: [
//       { key: "inv-list", label: "List All", to: "/inventory" , icon: <ListAltIcon />},
//       { key: "inv-details", label: "Inventory Details", to: "/inventory/details", icon: <InfoIcon /> },
//     ],
//   },
//   {
//     key: "consumers",
//     label: "Consumers",
//     icon: <PersonIcon />,
//     to: "/consumers/list",
//     children: [
//       { key: "cons-list", label: "List All", to: "/consumers/list", icon: <ListAltIcon /> },
//       { key: "cons-kyc", label: "KYC Pending List", to: "/consumers/kyc-pending", icon: <PendingActionsIcon /> },
//       { key: "cons-detail", label: "Consumer Details", to: "/consumers/details", icon: <InfoIcon /> },
//     ],
//   },
//   {
//     key: "routes",
//     label: "Routes",
//     icon: <RouteIcon />,
//     to: "/routes",
//     children: [
//       { key: "routes-active", label: "Active Routes", to: "/routes/active", icon: <ListAltIcon /> },
//       { key: "routes-mapping", label: "Route Mapping", to: "/routes/mapping", icon: <InfoIcon /> },
//     ],
//   },
//   {
//     key: "settings",
//     label: "Settings",
//     icon: <SettingsIcon />,
//     to: "/settings",
//   },
// ];

// export default function Sidebar() {
//   const theme = useTheme();
//   const navigate = useNavigate();
//   const location = useLocation();

//   // track open state per group key
//   const [openMap, setOpenMap] = useState<Record<string, boolean>>(() => {
//     const initial: Record<string, boolean> = {};
//     NAV.forEach((g) => {
//       initial[g.key] = false;
//     });
//     return initial;
//   });

//   // Auto-expand groups when current location matches a child route or parent
//   useEffect(() => {
//     const path = location.pathname;
//     const newOpen: Record<string, boolean> = {};
//     NAV.forEach((g) => {
//       const shouldOpen =
//         (g.children && g.children.some((c) => path.startsWith(c.to))) ||
//         (!!g.to && path.startsWith(g.to) && g.children?.length);
//       newOpen[g.key] = Boolean(shouldOpen);
//     });
//     setOpenMap((prev) => ({ ...prev, ...newOpen }));
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [location.pathname]);

//   const handleToggle = (group: NavGroup) => {
//     // When user clicks parent: expand and navigate to parent default page (Q1 = B)
//     setOpenMap((prev) => ({ ...prev, [group.key]: !prev[group.key] }));
//     if (group.to) {
//       navigate(group.to);
//     }
//   };

//   const isActive = (to: string) => {
//     // active if current path startsWith to or equals to
//     return location.pathname === to || location.pathname.startsWith(to + "/");
//   };

//   return (
//     <Drawer
//       variant="permanent"
//       sx={{
//         width: drawerWidth,
//         flexShrink: 0,
//         [`& .MuiDrawer-paper`]: {
//           width: drawerWidth,
//           bgcolor: "primary.main",
//           color: "white",
//           border: "none",
//           height: "100vh",
//           display: "flex",
//           flexDirection: "column",
//           boxSizing: "border-box",
//           p: 0,
//         },
//       }}
//     >
//       {/* Branding */}
//       <Box
//         sx={{
//           height: 120,
//           display: "flex",
//           alignItems: "center",
//           gap: 2,
//           px: 2,
//           borderBottom: "1px solid rgba(255,255,255,0.12)",
//         }}
//       >
//         <Box
//           sx={{
//             width: 48,
//             height: 48,
//             borderRadius: 2,
//             bgcolor: "secondary.main",
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//           }}
//         >
//           <InventoryIcon sx={{ color: "black", fontSize: 28 }} />
//         </Box>

//         <Box>
//           <Typography variant="h6" fontWeight={700}>
//             Lalitha Gas
//           </Typography>
//           <Typography variant="body2" sx={{ opacity: 0.85 }}>
//             Agency
//           </Typography>
//         </Box>
//       </Box>

//       {/* Navigation list */}
//       <Box sx={{ flexGrow: 1, overflow: "auto" }}>
//         <List disablePadding>
//           {NAV.map((group) => {
//             const groupOpen = Boolean(openMap[group.key]);
//             const activeParent =
//               (group.to && isActive(group.to)) ||
//               (group.children && group.children.some((c) => isActive(c.to)));

//             return (
//               <Box key={group.key}>
//                 {/* Parent item */}
//                 <ListItemButton
//                   onClick={() => handleToggle(group)}
//                   sx={{
//                     px: 2,
//                     py: 1.25,
//                     alignItems: "center",
//                     gap: 2,
//                     backgroundColor: activeParent ? alpha(theme.palette.primary.contrastText, 0.06) : "transparent",
//                     borderLeft: activeParent ? `4px solid ${theme.palette.secondary.main}` : "4px solid transparent",
//                     "&:hover": {
//                       backgroundColor: alpha(theme.palette.primary.contrastText, 0.05),
//                     },
//                   }}
//                 >
//                   <ListItemIcon sx={{ color: "white", minWidth: 36 }}>{group.icon}</ListItemIcon>
//                   <ListItemText
//                     primary={group.label}
//                     primaryTypographyProps={{ fontWeight: 600 }}
//                     sx={{ color: "white" }}
//                   />

//                   {group.children && group.children.length > 0 ? (
//                     groupOpen ? (
//                       <ExpandLess sx={{ color: "white" }} />
//                     ) : (
//                       <ExpandMore sx={{ color: "white" }} />
//                     )
//                   ) : null}
//                 </ListItemButton>

//                 {/* Submenu */}
//                 {group.children && group.children.length > 0 && (
//                   <Collapse in={groupOpen} timeout="auto" unmountOnExit>
//                     <List component="div" disablePadding>
//                       {group.children.map((child) => {
//                         const childActive = isActive(child.to);
//                         return (
//                           <ListItemButton
//                             key={child.key}
//                             component={NavLink}
//                             to={child.to}
//                             sx={{
//                               pl: 6,
//                               py: 1,
//                               color: childActive ? "primary.main" : "rgba(255,255,255,0.92)",
//                               backgroundColor: childActive ? "rgba(255,255,255,0.12)" : "transparent",
//                               borderLeft: childActive ? `4px solid ${theme.palette.secondary.main}` : "4px solid transparent",
//                               alignItems: "center",
//                               "&:hover": {
//                                 backgroundColor: alpha(theme.palette.primary.contrastText, 0.06),
//                                 color: "primary.main",
//                               },
//                             }}
//                           >
//                             <ListItemIcon sx={{ color: childActive ? "primary.main" : "rgba(255,255,255,0.9)", minWidth: 36 }}>
//                               {child.icon ?? <ListAltIcon />}
//                             </ListItemIcon>
//                             <ListItemText
//                               primary={child.label}
//                               primaryTypographyProps={{ fontSize: 14, fontWeight: 600 }}
//                             />
//                           </ListItemButton>
//                         );
//                       })}
//                     </List>
//                   </Collapse>
//                 )}
//               </Box>
//             );
//           })}
//         </List>
//       </Box>

//       {/* Footer / Contact / Version */}
//       <Box sx={{ p: 2, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
//         <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.7)" }}>
//           v1.0.0
//         </Typography>
//       </Box>
//     </Drawer>
//   );
// }
