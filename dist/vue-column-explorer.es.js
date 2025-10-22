import { defineComponent as N, createElementBlock as i, openBlock as s, Fragment as S, renderList as w, createElementVNode as v, createBlock as $, createCommentVNode as g, normalizeClass as B, toDisplayString as y, unref as M, computed as A, withModifiers as H, resolveDynamicComponent as R, createVNode as z, ref as U, createTextVNode as Q, onMounted as Z, onUnmounted as K, Teleport as ee, normalizeStyle as te, reactive as ne } from "vue";
import { defineStore as le } from "pinia";
import { ChevronRight as G, Folder as j, File as P, Clipboard as oe, FileText as se, Book as ce, User as ie, Filter as ae, RefreshCw as re, Mail as ue, Edit as W, Download as X, Trash as Y, Eye as de } from "lucide-vue-next";
const me = le("explorer", {
  state: () => ({
    columns: /* @__PURE__ */ new Map(),
    activeColumnIndex: -1,
    breadcrumb: [],
    globalFilters: {},
    config: {
      appearance: {
        columnWidth: 300,
        maxVisibleColumns: 4,
        animationDuration: 200,
        theme: "light"
      },
      behavior: {
        clickBehavior: "single",
        selectionPersistence: !1,
        autoLoadNextPage: !0,
        scrollBehavior: "smooth"
      },
      performance: {
        itemsPerPage: 50,
        virtualScrollThreshold: 100,
        maxConcurrentRequests: 2,
        requestTimeout: 1e4
      }
    }
  }),
  getters: {
    visibleColumns() {
      const e = [];
      for (let o = 0; o <= this.activeColumnIndex; o++) {
        const n = this.columns.get(o);
        n && e.push(n);
      }
      return e;
    },
    currentSelection() {
      const e = this.columns.get(this.activeColumnIndex);
      return (e == null ? void 0 : e.selectedIds) || /* @__PURE__ */ new Set();
    },
    canNavigateForward() {
      const e = this.columns.get(this.activeColumnIndex);
      return e ? e.selectedIds.size > 0 : !1;
    },
    getContext() {
      var n;
      const e = [];
      for (let t = 0; t <= this.activeColumnIndex; t++) {
        const l = this.columns.get(t);
        if (l) {
          const a = Array.from(l.selectedIds)[0], r = a && l.items.find((f) => f.id === a) || null;
          e.push({
            columnId: l.config.id,
            selectedItem: r,
            selectedIds: l.selectedIds
          });
        }
      }
      const o = e[e.length - 2];
      return {
        parentId: ((n = o == null ? void 0 : o.selectedItem) == null ? void 0 : n.id) || null,
        parentItem: (o == null ? void 0 : o.selectedItem) || null,
        breadcrumb: this.breadcrumb,
        globalFilters: this.globalFilters,
        columnChain: e,
        getParentData(t) {
          return e[e.length - 1 - t];
        },
        getColumnData(t) {
          return e.find((l) => l.columnId === t);
        }
      };
    }
  },
  actions: {
    setConfig(e) {
      this.config = {
        appearance: { ...this.config.appearance, ...e.appearance },
        behavior: { ...this.config.behavior, ...e.behavior },
        performance: { ...this.config.performance, ...e.performance }
      };
    },
    async openColumn(e, o) {
      const n = o ?? this.activeColumnIndex + 1;
      for (let l = this.columns.size - 1; l > n; l--)
        this.columns.delete(l);
      const t = {
        config: e,
        items: [],
        selectedIds: /* @__PURE__ */ new Set(),
        page: 0,
        hasMore: !0,
        isLoading: !1,
        error: null,
        filters: {}
      };
      this.columns.set(n, t), this.activeColumnIndex = n, n === 0 && (this.breadcrumb = [{
        columnId: e.id,
        columnName: e.name
      }]), await this.loadColumnData(n);
    },
    async loadColumnData(e, o = 0) {
      const n = this.columns.get(e);
      if (n) {
        n.isLoading = !0, n.error = null;
        try {
          const t = this.getContext, l = await n.config.dataProvider.fetch({
            parentId: t.parentId,
            page: o,
            filters: { ...this.globalFilters, ...n.filters },
            context: t
          });
          o === 0 ? n.items = l.items : n.items.push(...l.items), n.hasMore = l.hasMore, n.page = o;
        } catch (t) {
          n.error = t, console.error("Error loading column data:", t);
        } finally {
          n.isLoading = !1;
        }
      }
    },
    async loadNextPage(e) {
      const o = this.columns.get(e);
      !o || !o.hasMore || o.isLoading || await this.loadColumnData(e, o.page + 1);
    },
    async refreshColumn(e) {
      const o = this.columns.get(e);
      o && (o.selectedIds.clear(), await this.loadColumnData(e, 0));
    },
    selectItem(e, o, n = !1) {
      var l;
      const t = this.columns.get(e);
      !t || !((l = t.config.selection) != null && l.enabled) || (n && t.config.selection.multiple ? t.selectedIds.has(o) ? t.selectedIds.delete(o) : t.selectedIds.add(o) : (t.selectedIds.clear(), t.selectedIds.add(o)));
    },
    clearSelection(e) {
      const o = this.columns.get(e);
      o && o.selectedIds.clear();
    },
    async navigateToItem(e, o) {
      var a, r, f;
      const n = this.columns.get(o);
      if (!n || !n.config.itemClick) return;
      const t = this.getContext, l = await ((r = (a = n.config.itemClick).handler) == null ? void 0 : r.call(a, e, t));
      if (l != null && l.column)
        this.breadcrumb = this.breadcrumb.slice(0, o + 1), await this.openColumn(l.column, o + 1), this.breadcrumb.push({
          columnId: l.column.id,
          columnName: e.name,
          // Show selected item name in breadcrumb
          itemId: e.id,
          itemName: e.name
        });
      else if (l != null && l.action) {
        const x = (f = n.config.actions) == null ? void 0 : f.find((_) => _.key === l.action);
        x && await this.executeAction(o, x.key);
      } else l != null && l.custom && l.custom();
    },
    async executeAction(e, o) {
      var a;
      const n = this.columns.get(e);
      if (!n) return;
      const t = (a = n.config.actions) == null ? void 0 : a.find((r) => r.key === o);
      if (!t) return;
      const l = Array.from(n.selectedIds);
      if (l.length !== 0)
        try {
          const r = this.getContext;
          await t.handler(l, r), await this.refreshColumn(e);
        } catch (r) {
          console.error("Error executing action:", r);
        }
    },
    navigateToBreadcrumb(e) {
      for (let o = this.columns.size - 1; o > e; o--)
        this.columns.delete(o);
      this.activeColumnIndex = e, this.breadcrumb = this.breadcrumb.slice(0, e + 1);
    },
    setFilter(e, o, n) {
      const t = this.columns.get(e);
      t && (n == null || n === "" ? delete t.filters[o] : t.filters[o] = n, this.loadColumnData(e, 0));
    },
    setGlobalFilter(e, o) {
      o == null || o === "" ? delete this.globalFilters[e] : this.globalFilters[e] = o, this.visibleColumns.forEach((n, t) => {
        this.loadColumnData(t, 0);
      });
    }
  }
}), he = { class: "explorer-breadcrumb" }, fe = ["onClick"], ve = /* @__PURE__ */ N({
  __name: "ExplorerBreadcrumb",
  props: {
    breadcrumb: {}
  },
  emits: ["navigate"],
  setup(e, { emit: o }) {
    const n = o, t = (l) => {
      n("navigate", l);
    };
    return (l, a) => (s(), i("div", he, [
      (s(!0), i(S, null, w(e.breadcrumb, (r, f) => (s(), i("div", {
        key: f,
        class: "breadcrumb-item"
      }, [
        v("button", {
          class: B(["breadcrumb-item__button", { "breadcrumb-item__button--active": f === e.breadcrumb.length - 1 }]),
          onClick: (x) => t(f)
        }, y(r.itemName || r.columnName), 11, fe),
        f < e.breadcrumb.length - 1 ? (s(), $(M(G), {
          key: 0,
          size: 16,
          class: "breadcrumb-separator"
        })) : g("", !0)
      ]))), 128))
    ]));
  }
}), L = (e, o) => {
  const n = e.__vccOpts || e;
  for (const [t, l] of o)
    n[t] = l;
  return n;
}, be = /* @__PURE__ */ L(ve, [["__scopeId", "data-v-27ca8931"]]), ge = {
  key: 0,
  class: "explorer-item__checkbox"
}, xe = ["checked"], Ce = { class: "explorer-item__content" }, pe = {
  key: 0,
  class: "explorer-item__icon"
}, ke = { class: "explorer-item__details" }, ye = { class: "explorer-item__name" }, _e = {
  key: 0,
  class: "explorer-item__metadata"
}, Ie = {
  key: 1,
  class: "explorer-item__chevron"
}, Se = {
  key: 0,
  class: "item-count"
}, we = /* @__PURE__ */ N({
  __name: "ExplorerItem",
  props: {
    item: {},
    selected: { type: Boolean, default: !1 },
    selectable: { type: Boolean, default: !1 },
    clickable: { type: Boolean, default: !0 },
    showIcon: { type: Boolean, default: !0 },
    showMetadata: { type: Boolean, default: !0 }
  },
  emits: ["click", "dblclick", "contextmenu", "select"],
  setup(e, { emit: o }) {
    const n = e, t = o, l = A(() => n.item.icon ? {
      "lucide:user": ie,
      "lucide:folder": j,
      "lucide:file": P,
      "lucide:book": ce,
      "lucide:file-text": se,
      "lucide:clipboard": oe
    }[n.item.icon] || P : n.item.type === "folder" ? j : P), a = (m) => {
      n.clickable && t("click", n.item, m);
    }, r = (m) => {
      t("dblclick", n.item, m);
    }, f = (m) => {
      t("contextmenu", n.item, m);
    }, x = (m) => {
      t("select", n.item, !0);
    }, _ = (m) => {
      const I = Object.entries(m);
      if (I.length === 0) return "";
      const E = I[0];
      return String(E[1]);
    };
    return (m, I) => (s(), i("div", {
      class: B(["explorer-item", {
        "explorer-item--selected": e.selected,
        "explorer-item--clickable": e.clickable
      }]),
      onClick: a,
      onDblclick: r,
      onContextmenu: H(f, ["prevent"])
    }, [
      e.selectable ? (s(), i("div", ge, [
        v("input", {
          type: "checkbox",
          checked: e.selected,
          onClick: H(x, ["stop"])
        }, null, 8, xe)
      ])) : g("", !0),
      v("div", Ce, [
        e.showIcon ? (s(), i("div", pe, [
          (s(), $(R(l.value), { size: 20 }))
        ])) : g("", !0),
        v("div", ke, [
          v("div", ye, y(e.item.name), 1),
          e.showMetadata && e.item.metadata ? (s(), i("div", _e, y(_(e.item.metadata)), 1)) : g("", !0)
        ])
      ]),
      e.item.count !== void 0 || e.item.hasChildren ? (s(), i("div", Ie, [
        e.item.count !== void 0 ? (s(), i("span", Se, y(e.item.count), 1)) : g("", !0),
        z(M(G), { size: 16 })
      ])) : g("", !0)
    ], 34));
  }
}), Me = /* @__PURE__ */ L(we, [["__scopeId", "data-v-b2b4e9d4"]]), $e = { class: "explorer-column__header" }, Ae = { class: "explorer-column__title" }, Ee = { class: "explorer-column__actions" }, Fe = {
  key: 0,
  class: "explorer-column__filters"
}, Be = { class: "filter-item__label" }, Ne = ["placeholder", "value", "onInput"], Le = ["placeholder", "value", "onInput"], De = ["value", "onChange"], ze = ["value"], Oe = {
  key: 0,
  class: "explorer-column__loading"
}, Te = {
  key: 1,
  class: "explorer-column__error"
}, Pe = {
  key: 2,
  class: "explorer-column__empty"
}, Re = {
  key: 3,
  class: "explorer-column__items"
}, Ve = {
  key: 0,
  class: "explorer-column__loading-more"
}, qe = {
  key: 1,
  class: "explorer-column__footer"
}, He = { class: "explorer-column__selection-info" }, Ue = { class: "explorer-column__quick-actions" }, je = ["onClick"], Ge = /* @__PURE__ */ N({
  __name: "ExplorerColumn",
  props: {
    columnState: {},
    index: {},
    isActive: { type: Boolean }
  },
  emits: ["item-click", "item-select", "context-menu", "refresh", "load-more", "action", "filter-change"],
  setup(e, { emit: o }) {
    const n = e, t = o, l = U(null), a = U(!1), r = A(() => n.columnState.config.filters && n.columnState.config.filters.length > 0), f = A(() => n.columnState.selectedIds.size > 0), x = A(() => {
      var d;
      return ((d = n.columnState.config.view) == null ? void 0 : d.loadingRows) || 10;
    }), _ = A(() => {
      var d;
      return ((d = n.columnState.config.view) == null ? void 0 : d.emptyMessage) || "No items found";
    }), m = A(() => {
      if (!n.columnState.config.actions) return [];
      const d = n.columnState.items.filter(
        (c) => n.columnState.selectedIds.has(c.id)
      ), h = d.length;
      return n.columnState.config.actions.filter((c) => h === 1 && c.showOnSingleSelect === !1 || h > 1 && c.showOnMultipleSelect === !1 || h === 1 && c.showOnMultipleSelect === !0 && c.showOnSingleSelect === !1 || h > 1 && c.showOnSingleSelect === !0 && c.showOnMultipleSelect === !1 ? !1 : c.visible ? c.visible(d) : !0);
    }), I = () => {
      a.value = !a.value;
    }, E = (d, h) => {
      t("item-click", d, n.index);
    }, O = (d, h) => {
      t("item-select", d, n.index, h);
    }, T = (d, h) => {
      t("context-menu", d, n.index, h);
    }, u = () => {
      t("refresh", n.index);
    }, b = () => {
      if (!l.value) return;
      const { scrollTop: d, scrollHeight: h, clientHeight: c } = l.value;
      d + c >= h - 100 && n.columnState.hasMore && !n.columnState.isLoading && t("load-more", n.index);
    }, C = (d) => {
      t("action", d, n.index);
    }, p = (d, h) => {
      t("filter-change", d, h, n.index);
    }, J = (d) => ({
      "lucide:trash": Y,
      "lucide:download": X,
      "lucide:edit": W,
      "lucide:mail": ue
    })[d] || null;
    return (d, h) => (s(), i("div", {
      class: B(["explorer-column", { "explorer-column--active": e.isActive }])
    }, [
      v("div", $e, [
        v("h3", Ae, y(e.columnState.config.name), 1),
        v("div", Ee, [
          r.value ? (s(), i("button", {
            key: 0,
            class: B(["explorer-column__filter-btn", { active: a.value }]),
            onClick: I
          }, [
            z(M(ae), { size: 16 })
          ], 2)) : g("", !0),
          v("button", {
            class: "explorer-column__refresh-btn",
            onClick: u
          }, [
            z(M(re), { size: 16 })
          ])
        ])
      ]),
      a.value && r.value ? (s(), i("div", Fe, [
        (s(!0), i(S, null, w(e.columnState.config.filters, (c) => (s(), i("div", {
          key: c.key,
          class: "filter-item"
        }, [
          v("label", Be, y(c.label), 1),
          c.type === "search" ? (s(), i("input", {
            key: 0,
            type: "text",
            class: "filter-item__input",
            placeholder: `Search ${c.label.toLowerCase()}...`,
            value: e.columnState.filters[c.key] || "",
            onInput: (k) => p(c.key, k.target.value)
          }, null, 40, Ne)) : c.type === "number" ? (s(), i("input", {
            key: 1,
            type: "number",
            class: "filter-item__input",
            placeholder: c.label,
            value: e.columnState.filters[c.key] || "",
            onInput: (k) => p(c.key, k.target.value)
          }, null, 40, Le)) : c.type === "select" ? (s(), i("select", {
            key: 2,
            class: "filter-item__select",
            value: e.columnState.filters[c.key] || "",
            onChange: (k) => p(c.key, k.target.value)
          }, [
            h[0] || (h[0] = v("option", { value: "" }, "All", -1)),
            (s(!0), i(S, null, w(c.options, (k) => (s(), i("option", {
              key: k.value,
              value: k.value
            }, y(k.label), 9, ze))), 128))
          ], 40, De)) : g("", !0)
        ]))), 128))
      ])) : g("", !0),
      v("div", {
        ref_key: "scrollContainer",
        ref: l,
        class: "explorer-column__content",
        onScroll: b
      }, [
        e.columnState.isLoading && e.columnState.items.length === 0 ? (s(), i("div", Oe, [
          (s(!0), i(S, null, w(x.value, (c) => (s(), i("div", {
            key: c,
            class: "skeleton-item"
          }))), 128))
        ])) : e.columnState.error ? (s(), i("div", Te, [
          h[1] || (h[1] = v("p", null, "Error loading data", -1)),
          v("button", { onClick: u }, "Retry")
        ])) : e.columnState.items.length === 0 ? (s(), i("div", Pe, y(_.value), 1)) : (s(), i("div", Re, [
          (s(!0), i(S, null, w(e.columnState.items, (c) => {
            var k, V, q;
            return s(), $(Me, {
              key: c.id,
              item: c,
              selected: e.columnState.selectedIds.has(c.id),
              selectable: ((k = e.columnState.config.selection) == null ? void 0 : k.multiple) ?? !1,
              clickable: !0,
              "show-icon": ((V = e.columnState.config.view) == null ? void 0 : V.showIcon) ?? !0,
              "show-metadata": ((q = e.columnState.config.view) == null ? void 0 : q.showMetadata) ?? !0,
              onClick: (F, D) => E(F),
              onSelect: (F, D) => O(F, D),
              onContextmenu: (F, D) => T(F, D)
            }, null, 8, ["item", "selected", "selectable", "show-icon", "show-metadata", "onClick", "onSelect", "onContextmenu"]);
          }), 128)),
          e.columnState.isLoading && e.columnState.items.length > 0 ? (s(), i("div", Ve, " Loading more... ")) : g("", !0)
        ]))
      ], 544),
      f.value ? (s(), i("div", qe, [
        v("div", He, y(e.columnState.selectedIds.size) + " selected ", 1),
        v("div", Ue, [
          (s(!0), i(S, null, w(m.value, (c) => (s(), i("button", {
            key: c.key,
            class: B(["action-btn", `action-btn--${c.color || "default"}`]),
            onClick: (k) => C(c.key)
          }, [
            c.icon ? (s(), $(R(J(c.icon)), {
              key: 0,
              size: 14
            })) : g("", !0),
            Q(" " + y(c.label), 1)
          ], 10, je))), 128))
        ])
      ])) : g("", !0)
    ], 2));
  }
}), We = /* @__PURE__ */ L(Ge, [["__scopeId", "data-v-0d17a401"]]), Xe = ["onClick"], Ye = /* @__PURE__ */ N({
  __name: "ExplorerContextMenu",
  props: {
    visible: { type: Boolean },
    x: {},
    y: {},
    actions: {}
  },
  emits: ["close", "action"],
  setup(e, { emit: o }) {
    const n = e, t = o, l = () => {
      t("close");
    }, a = (x) => {
      t("action", x.key), t("close");
    }, r = (x) => ({
      "lucide:download": X,
      "lucide:trash": Y,
      "lucide:edit": W,
      "lucide:eye": de
    })[x] || null, f = () => {
      n.visible && t("close");
    };
    return Z(() => {
      document.addEventListener("click", f);
    }), K(() => {
      document.removeEventListener("click", f);
    }), (x, _) => (s(), $(ee, { to: "body" }, [
      e.visible ? (s(), i("div", {
        key: 0,
        class: "context-menu",
        style: te({ top: `${e.y}px`, left: `${e.x}px` }),
        onClick: l
      }, [
        (s(!0), i(S, null, w(e.actions, (m) => (s(), i("div", {
          key: m.key,
          class: "context-menu__item",
          onClick: (I) => a(m)
        }, [
          m.icon ? (s(), $(R(r(m.icon)), {
            key: 0,
            size: 16
          })) : g("", !0),
          v("span", null, y(m.label), 1)
        ], 8, Xe))), 128))
      ], 4)) : g("", !0)
    ]));
  }
}), Je = /* @__PURE__ */ L(Ye, [["__scopeId", "data-v-569d2f59"]]), Qe = { class: "explorer-container" }, Ze = { class: "explorer-viewport" }, Ke = /* @__PURE__ */ N({
  __name: "ExplorerContainer",
  props: {
    rootColumn: {}
  },
  setup(e, { expose: o }) {
    const n = e, t = me(), l = ne({
      visible: !1,
      x: 0,
      y: 0,
      actions: [],
      targetItem: null,
      targetColumnIndex: -1
    });
    n.rootColumn && t.openColumn(n.rootColumn, 0);
    const a = async (u, b) => {
      t.selectItem(b, u.id, !1);
      const C = t.columns.get(b);
      C != null && C.config.itemClick && await t.navigateToItem(u, b);
    }, r = (u, b, C) => {
      t.selectItem(b, u.id, C);
    }, f = (u, b, C) => {
      const p = t.columns.get(b);
      !(p != null && p.config.actions) || p.config.actions.length === 0 || (p.selectedIds.has(u.id) || t.selectItem(b, u.id, !1), l.visible = !0, l.x = C.clientX, l.y = C.clientY, l.actions = p.config.actions, l.targetItem = u, l.targetColumnIndex = b);
    }, x = () => {
      l.visible = !1;
    }, _ = async (u) => {
      l.targetColumnIndex >= 0 && await t.executeAction(l.targetColumnIndex, u);
    }, m = (u) => {
      t.navigateToBreadcrumb(u);
    }, I = async (u) => {
      await t.refreshColumn(u);
    }, E = async (u) => {
      await t.loadNextPage(u);
    }, O = async (u, b) => {
      await t.executeAction(b, u);
    }, T = (u, b, C) => {
      t.setFilter(C, u, b);
    };
    return o({
      store: t,
      openColumn: (u) => t.openColumn(u),
      refresh: () => t.refreshColumn(t.activeColumnIndex)
    }), (u, b) => (s(), i("div", Qe, [
      M(t).breadcrumb.length > 0 ? (s(), $(be, {
        key: 0,
        breadcrumb: M(t).breadcrumb,
        onNavigate: m
      }, null, 8, ["breadcrumb"])) : g("", !0),
      v("div", Ze, [
        (s(!0), i(S, null, w(M(t).visibleColumns, (C, p) => (s(), $(We, {
          key: p,
          "column-state": C,
          index: p,
          "is-active": p === M(t).activeColumnIndex,
          onItemClick: a,
          onItemSelect: r,
          onContextMenu: f,
          onRefresh: I,
          onLoadMore: E,
          onAction: O,
          onFilterChange: T
        }, null, 8, ["column-state", "index", "is-active"]))), 128))
      ]),
      z(Je, {
        visible: l.visible,
        x: l.x,
        y: l.y,
        actions: l.actions,
        onClose: x,
        onAction: _
      }, null, 8, ["visible", "x", "y", "actions"])
    ]));
  }
}), et = /* @__PURE__ */ L(Ke, [["__scopeId", "data-v-4e9a0e53"]]);
function ot(e) {
  var o, n, t;
  return {
    id: e.id,
    name: e.name,
    dataProvider: {
      fetch: async (l) => {
        const a = await e.fetchData(l);
        return {
          items: Array.isArray(a) ? a : [],
          hasMore: !1
        };
      }
    },
    selection: {
      enabled: e.allowMultipleSelection !== void 0 || !!(e.singleActions && e.singleActions.length > 0) || !!(e.multipleActions && e.multipleActions.length > 0),
      multiple: e.allowMultipleSelection !== void 0 ? e.allowMultipleSelection : !1
    },
    filters: (o = e.filters) == null ? void 0 : o.map((l) => ({
      ...l,
      default: void 0
    })),
    actions: [
      ...((n = e.singleActions) == null ? void 0 : n.map((l) => ({
        key: l.key,
        label: l.label,
        icon: l.icon,
        color: l.color,
        showOnSingleSelect: !0,
        showOnMultipleSelect: !1,
        handler: async (a, r) => {
          await l.handler(a);
        }
      }))) || [],
      ...((t = e.multipleActions) == null ? void 0 : t.map((l) => ({
        key: l.key,
        label: l.label,
        icon: l.icon,
        color: l.color,
        showOnSingleSelect: !1,
        showOnMultipleSelect: !0,
        handler: async (a, r) => {
          await l.handler(a);
        }
      }))) || []
    ],
    itemClick: e.onItemClick ? {
      type: "navigate",
      handler: async (l, a) => {
        const r = e.onItemClick(l, a);
        return r ? { column: r } : {};
      }
    } : void 0,
    view: {
      showIcon: !0,
      showMetadata: !0,
      emptyMessage: `No ${e.name.toLowerCase()} found`
    }
  };
}
const st = {
  install(e) {
    e.component("ExplorerContainer", et);
  }
};
export {
  et as ExplorerContainer,
  ot as createColumn,
  st as default,
  me as useExplorerStore
};
