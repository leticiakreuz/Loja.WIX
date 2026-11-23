"use client";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, BadgeCheck, ChevronDown, Heart, Menu, Minus, Plus, Search, ShieldCheck, ShoppingBag, Truck, X, MessageCircle, CreditCard, Flower2 } from "lucide-react";
import "./storefront.css";
import "./brand.css";
import type { Catalog, Product } from "../lib/catalog-types";
const money=(n:number)=>n.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
function Logo({ footer = false }: { footer?: boolean }) {
  return (
    <a className="logo brand-logo" href="#inicio" aria-label="WIX Make & Acessórios, início">
      {footer && (
        <svg width="0" height="0" aria-hidden="true" style={{ position: "absolute" }}>
          <defs>
            <filter id="wix-footer-ink" colorInterpolationFilters="sRGB">
              <feGaussianBlur stdDeviation="0.3" />
              <feColorMatrix
                type="matrix"
                values="0 0 0 0 0.957  0 0 0 0 0.918  0 0 0 0 0.973  -5.1 0 0 0 4.4"
              />
            </filter>
          </defs>
        </svg>
      )}
      <img src="/brand/wix-make-acessorios.jpeg" alt="WIX Make & Acessórios" width={1600} height={1565} />
    </a>
  );
}
function Photo({tile,label}:{tile:number;label:string}){return <div role="img" aria-label={label} className={`product-image tile-${tile}`}/>}
export default function Storefront({ catalog }: { catalog: Catalog }) {
const products = catalog.products;
const categories = catalog.categories.map(category => category.name);
const isDemo = catalog.source === "demo" || products.some(product => product.isDemo);
const storageKey = catalog.source === "demo" ? "sua-loja-preview" : "wix-storefront-cart";
const quantityLimit = (product: Product) => Math.min(product.stock, 99);
const [query,setQuery]=useState("");const [category,setCategory]=useState("Todos");const [favorites,setFavorites]=useState<number[]>([]);const [cart,setCart]=useState<Record<number,number>>({});const [ready,setReady]=useState(false);const [onlyFavorites,setOnlyFavorites]=useState(false);const [onlyOffers,setOnlyOffers]=useState(false);const [menu,setMenu]=useState(false);const [selected,setSelected]=useState<Product|null>(null);const [panel,setPanel]=useState<"cart"|"product"|"info"|null>(null);const [info,setInfo]=useState({title:"",text:""});const [toast,setToast]=useState("");const [sort,setSort]=useState("featured");const dialog=useRef<HTMLDialogElement>(null);
useEffect(() => {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || "{}");
    if (Array.isArray(saved.favorites)) {
      setFavorites(saved.favorites.filter((id: number) => products.some(product => product.id === id)));
    }
    const restoredCart: Record<number, number> = {};
    for (const product of products) {
      const quantity = saved.cart?.[product.id];
      if (Number.isInteger(quantity) && quantity > 0 && product.stock > 0) {
        restoredCart[product.id] = Math.min(quantity, product.stock, 99);
      }
    }
    setCart(restoredCart);
  } catch {}
  setReady(true);
}, [products, storageKey]);
useEffect(() => {
  if (!ready) return;
  try {
    localStorage.setItem(storageKey, JSON.stringify({ favorites, cart }));
  } catch {}
}, [favorites, cart, ready, storageKey]);
useEffect(()=>{if(panel){if(!dialog.current?.open)dialog.current?.showModal();document.body.style.overflow="hidden"}else{dialog.current?.close();document.body.style.overflow=""}return()=>{document.body.style.overflow=""}},[panel]);
useEffect(()=>{if(toast){const t=setTimeout(()=>setToast(""),3000);return()=>clearTimeout(t)}},[toast]);
const count=Object.values(cart).reduce((a,b)=>a+b,0);const total=products.reduce((s,p)=>s+p.price*(cart[p.id]||0),0);
function add(product: Product) {
  const limit = quantityLimit(product);
  if (limit === 0) return;
  const currentQuantity = cart[product.id] || 0;
  if (currentQuantity >= limit) {
    setToast("Você já adicionou a quantidade disponível.");
    return;
  }
  setCart(current => ({ ...current, [product.id]: Math.min((current[product.id] || 0) + 1, limit) }));
  setToast(product.name + " adicionado à sacola");
}
function favorite(id:number){setFavorites(f=>f.includes(id)?f.filter(x=>x!==id):[...f,id])}
function browse(cat="Todos",offers=false){setCategory(cat);setOnlyFavorites(false);setOnlyOffers(offers);setQuery("");setMenu(false);document.getElementById("produtos")?.scrollIntoView({behavior:"smooth"})}
function showInfo(title:string,text:string){setInfo({title,text});setPanel("info")}
let filtered=products.filter(p=>(category==="Todos"||p.category===category)&&(!onlyFavorites||favorites.includes(p.id))&&(!onlyOffers||!!p.old)&&`${p.name} ${p.detail} ${p.category}`.toLocaleLowerCase("pt-BR").includes(query.toLocaleLowerCase("pt-BR")));
if(sort==="asc")filtered=[...filtered].sort((a,b)=>a.price-b.price);if(sort==="desc")filtered=[...filtered].sort((a,b)=>b.price-a.price);
function card(p:Product){return <article className="product-card" key={p.id}><div className="product-photo"><button className="photo-link" onClick={()=>{setSelected(p);setPanel("product")}} aria-label={`Ver detalhes: ${p.name}`}><Photo tile={p.tile} label={p.name}/></button>{p.old?<span className="tag discount">−{Math.round((1-p.price/p.old)*100)}%</span>:p.tag&&<span className="tag">{p.tag}</span>}<button className={`favorite ${favorites.includes(p.id)?"active":""}`} aria-label={`${favorites.includes(p.id)?"Remover":"Favoritar"} ${p.name}`} aria-pressed={favorites.includes(p.id)} onClick={()=>favorite(p.id)}><Heart size={20} fill={favorites.includes(p.id)?"currentColor":"none"}/></button></div><div className="product-copy"><span className="product-category">{p.category}</span><button className="product-title" onClick={()=>{setSelected(p);setPanel("product")}}>{p.name}</button><p>{p.detail}</p><div className="prices"><strong>{money(p.price)}</strong>{p.old&&<del>{money(p.old)}</del>}</div><button className="buy" disabled={p.stock === 0} onClick={()=>add(p)}>{p.stock === 0 ? "Indisponível" : "Adicionar à sacola"} <Plus size={16}/></button></div></article>}
return <><a className="skip" href="#conteudo">Pular para o conteúdo</a>
<header><div className="header-main wrap"><button className="icon-button mobile-menu" aria-label="Abrir menu" aria-expanded={menu} onClick={()=>setMenu(!menu)}><Menu/></button><Logo/><nav aria-label="Navegação principal" className={menu?"open":""}><a href="#inicio" onClick={()=>setMenu(false)}>Início</a><button onClick={()=>browse()}>Produtos</button><a href="#categorias" onClick={()=>setMenu(false)}>Categorias</a><a href="#lancamentos" onClick={()=>setMenu(false)}>Lançamentos</a><button onClick={()=>browse("Todos",true)}>Ofertas</button></nav><div className="header-actions"><form className="search" onSubmit={e=>{e.preventDefault();document.getElementById("produtos")?.scrollIntoView({behavior:"smooth"})}}><Search size={17}/><input type="search" aria-label="Pesquisar produtos" placeholder="O que você procura?" value={query} onChange={e=>{setQuery(e.target.value);setCategory("Todos");setOnlyFavorites(false);setOnlyOffers(false)}}/></form><button className="icon-button" aria-label={`Ver favoritos, ${favorites.length} produtos`} onClick={()=>{setOnlyFavorites(!onlyFavorites);setOnlyOffers(false);setCategory("Todos");setQuery("");document.getElementById("produtos")?.scrollIntoView({behavior:"smooth"})}}><Heart size={23}/></button><button className="icon-button bag-button" aria-label={`Abrir sacola, ${count} itens`} onClick={()=>setPanel("cart")}><ShoppingBag size={23}/><span className="bag-count">{count}</span></button></div></div></header>
<main id="conteudo"><section className="hero" id="inicio"><img className="hero-background" src="/images/hero.png" alt="Cosméticos rosados e lavanda em uma composição delicada" fetchPriority="high"/><div className="wrap hero-inner"><div className="hero-copy"><span className="eyebrow"><span/> WIX MAKE & ACESSÓRIOS</span><h1>Sua beleza.<br/> Seu cuidado.<br/> <em>Seu amor-próprio.</em></h1><p>Um convite para se olhar com carinho, valorizar sua essência e fazer do autocuidado um momento seu.</p><button className="primary" onClick={()=>browse()}>Ver produtos <ArrowRight size={18}/></button><span className="hero-note">Beleza para todas. Acolhimento para você.</span></div></div><span className="hero-decoration">você merece<br/> esse carinho ♡</span></section>
<section className="benefits" aria-label="Diferenciais propostos para a loja"><div className="wrap benefit-row"><div><BadgeCheck/><span>Produtos originais<small>Cuidado em cada escolha</small></span></div><div><Truck/><span>Entrega segura<small>Carinho até a sua porta</small></span></div><div><CreditCard/><span>Pagamento facilitado<small>Condições a confirmar</small></span></div><div><Flower2/><span>Atendimento próximo<small>Beleza com acolhimento</small></span></div></div></section>
<section className="wrap section" id="categorias"><div className="section-heading"><div><span className="eyebrow">ENCONTRE O SEU RITUAL</span><h2>Nossas Categorias</h2><p>Encontre seu jeito de cuidar de você.</p></div><button className="text-link" onClick={()=>browse()}>Explorar tudo <ArrowRight size={17}/></button></div><div className="categories">{categories.map((c,i)=><button key={c} className="category" onClick={()=>browse(c)}><div className="category-photo"><Photo tile={catalog.categories[i].tile} label={`Categoria ${c}`}/><span className="category-arrow"><ArrowRight size={17}/></span></div><span>{c}</span></button>)}</div></section>
<section className="launch wrap" id="lancamentos"><img src="/images/beauty.png" alt="Retrato de beleza com maquiagem delicada e flores de lavanda" loading="lazy"/><div className="launch-copy"><span className="eyebrow">AUTOESTIMA EM CADA ESCOLHA</span><h2>Se valorizar<br/> é um gesto de<br/> <em>amor-próprio.</em></h2><p>Sua beleza tem espaço aqui.<br/> Do seu jeito, no seu tempo.</p><button className="primary" onClick={()=>{browse();setSort("featured")}}>Conheça a coleção <ArrowRight size={17}/></button></div><span className="launch-caption">Você merece se sentir bem.</span></section>
<section className="catalog wrap section" id="produtos"><div className="section-heading"><div><span className="eyebrow">UM CARINHO NA SUA ROTINA</span><h2>{onlyFavorites?"Seus Favoritos":onlyOffers?"Ofertas Especiais":"Produtos em Destaque"}</h2><p>{onlyFavorites?"Os seus próximos queridinhos, reunidos aqui.":"Escolhas para celebrar sua beleza e seu autocuidado."}</p></div>{isDemo && <span className="demo-pill">Produtos e preços ilustrativos</span>}</div><div className="catalog-toolbar"><div className="filter-scroll">{["Todos",...categories].map(c=><button key={c} className={category===c?"filter active":"filter"} onClick={()=>setCategory(c)}>{c}</button>)}</div><label className="sort"><span className="sr-only">Ordenar produtos</span><select value={sort} onChange={e=>setSort(e.target.value)}><option value="featured">Destaques</option><option value="asc">Menor preço</option><option value="desc">Maior preço</option></select><ChevronDown size={14}/></label></div>{(query||onlyFavorites||onlyOffers)&&<div className="search-summary"><span>{filtered.length} produto(s){query&&` para “${query}”`}</span><button className="text-link" onClick={()=>{setQuery("");setOnlyFavorites(false);setOnlyOffers(false);setCategory("Todos")}}>Limpar filtros <X size={14}/></button></div>}<div className="product-grid">{filtered.map(card)}</div>{!filtered.length&&<div className="empty"><Search/><h3>Nenhum produto por aqui</h3><p>Experimente outra busca ou explore todas as categorias.</p><button className="primary" onClick={()=>browse()}>Ver todos os produtos <ArrowRight size={17}/></button></div>}</section>
<section className="care-banner wrap"><div><span className="eyebrow">DA CABEÇA AOS PÉS</span><h2>Autocuidado que abraça<br/>a sua essência.</h2><p>Reserve um momento para você.<br/> Se cuidar também é reconhecer o seu valor.</p><a className="text-link" href="#categorias">Encontre seu próximo favorito <ArrowRight size={17}/></a></div><img src="/images/hero.png" alt="Coleção demonstrativa de cuidados e beleza" loading="lazy"/></section>
<section className="offers wrap section" id="ofertas"><div className="section-heading"><div><span className="eyebrow">MAIS BELEZA, MAIS POSSIBILIDADES</span><h2>Ofertas Especiais</h2><p>Um convite para renovar os seus favoritos.</p></div><button className="text-link" onClick={()=>browse("Todos",true)}>Ver todas <ArrowRight size={17}/></button></div><div className="product-grid offers-grid">{products.filter(p=>p.old).map(card)}</div></section>

<section className="brand-values wrap" aria-labelledby="brand-values-title">
  <div className="brand-monogram">
    <img src="/brand/wix-monograma.jpeg" alt="Monograma W da WIX" width={1600} height={1565} loading="lazy" />
  </div>
  <div className="brand-values-copy">
    <span className="eyebrow">NOSSA ESSÊNCIA</span>
    <h2 id="brand-values-title">Beleza para todas.<br/><em>Um olhar de carinho para você.</em></h2>
    <p>A WIX Make &amp; Acessórios é um convite para celebrar quem você é. Acreditamos no autocuidado como um gesto de amor-próprio e na beleza como uma forma de expressão que acolhe e valoriza cada pessoa.</p>
    <ul className="brand-keywords" aria-label="Valores da marca">
      {["Amor-próprio", "Autoestima", "Acolhimento", "Valorização", "Beleza para todas", "Autocuidado"].map(value => <li key={value}>{value}</li>)}
    </ul>
  </div>
</section>
<section className="brand-section wrap" id="marcas"><Flower2 size={26}/><h2>Suas marcas favoritas, em breve por aqui.</h2><p>Este espaço receberá as marcas e os logotipos aprovados pela loja.</p></section>
<section className="newsletter"><div className="wrap newsletter-inner"><div><span className="eyebrow">UM ESPAÇO DE ACOLHIMENTO</span><h2>Faça parte da nossa comunidade</h2><p>Inspirações de autocuidado e beleza para acompanhar o seu dia.</p></div><form onSubmit={e=>{e.preventDefault();showInfo("Prévia do cadastro","O formulário foi validado. Nesta versão de aprovação, seu e-mail não foi armazenado nem enviado. A inscrição será ativada após a definição da ferramenta de newsletter e da política de privacidade.")}}><div className="email-field"><label className="sr-only" htmlFor="newsletter-email">Seu e-mail</label><input id="newsletter-email" type="email" required placeholder="Seu melhor e-mail"/><button type="submit">Quero receber <ArrowRight size={17}/></button></div><label className="consent"><input type="checkbox" required/><span>Concordo em receber novidades. <button type="button" onClick={()=>showInfo("Privacidade","Esta prévia não coleta e-mails e não processa pedidos. A sacola e os favoritos ficam apenas neste navegador. A política definitiva será elaborada com os dados da loja antes da publicação.")}>Saiba sobre privacidade.</button></span></label><small className="newsletter-note">Formulário demonstrativo · inscrições ainda não ativas</small></form></div></section></main>
<footer><div className="wrap footer-main"><div><Logo footer/><p>Beleza para todas.<br/>Amor-próprio em cada cuidado.</p><span className="footer-demo">Amor-próprio • Autoestima • Acolhimento</span></div><div><h3>Explore</h3><a href="#categorias">Nossas categorias</a><a href="#produtos">Produtos em destaque</a><a href="#lancamentos">Nova coleção</a><a href="#ofertas">Ofertas especiais</a></div><div><h3>Informações</h3>{["Sobre a loja","Política de privacidade","Trocas e devoluções"].map(t=><button key={t} onClick={()=>showInfo(t,t==="Política de privacidade"?"Nesta prévia, a sacola e os favoritos são salvos somente no seu navegador. Não há cadastro ou processamento de pedidos. O texto definitivo será preparado com os dados e as operações reais da loja.":"O conteúdo institucional será preenchido com informações reais fornecidas pela proprietária antes da publicação. Esta é uma versão demonstrativa para aprovação visual.")}>{t}</button>)}</div><div><h3>Vamos conversar?</h3><p>Seu atendimento, com mais carinho.</p><button className="footer-contact" onClick={()=>showInfo("Atendimento pelo WhatsApp","O número da loja ainda não foi informado. Após a confirmação do contato oficial, este botão abrirá a conversa diretamente no WhatsApp.")}><MessageCircle size={18}/> Atendimento em breve</button><small>Contato e horários a confirmar.</small></div></div><div className="wrap footer-bottom"><span>© 2026 WIX Make & Acessórios{isDemo ? " · Prévia demonstrativa." : "."}</span><span><ShieldCheck size={15}/> Nenhuma compra real é realizada nesta prévia.</span></div></footer>
<dialog ref={dialog} className={`dialog ${panel==="cart"?"cart-dialog":""}`} onCancel={()=>setPanel(null)} aria-labelledby="dialog-title"><button className="dialog-close icon-button" aria-label="Fechar janela" onClick={()=>setPanel(null)}><X/></button>
{panel==="cart"&&<div className="cart-panel"><span className="eyebrow">SEUS NOVOS FAVORITOS</span><h2 id="dialog-title">Sua sacola <small>({count})</small></h2><p className="panel-note">Sacola demonstrativa · não gera pedidos</p>{count?<><div className="cart-items">{products.filter(p=>cart[p.id]).map(p=><div className="cart-item" key={p.id}><Photo tile={p.tile} label={p.name}/><div><strong>{p.name}</strong><small>{money(p.price)}</small><div className="quantity"><button aria-label={`Diminuir quantidade de ${p.name}`} onClick={()=>setCart(c=>{const v={...c};if(v[p.id]>1)v[p.id]--;else delete v[p.id];return v})}><Minus size={14}/></button><span>{cart[p.id]}</span><button aria-label={`Aumentar quantidade de ${p.name}`} disabled={cart[p.id]>=quantityLimit(p)} onClick={()=>setCart(c=>({...c,[p.id]:c[p.id]+1}))}><Plus size={14}/></button></div></div><button className="remove icon-button" aria-label={`Remover ${p.name}`} onClick={()=>setCart(c=>{const v={...c};delete v[p.id];return v})}><X size={17}/></button></div>)}</div><div className="subtotal"><span>Subtotal</span><strong>{money(total)}</strong></div><p className="panel-note">Frete e condições de pagamento serão definidos com a loja. Nenhuma cobrança será realizada.</p><button className="primary full" onClick={()=>setPanel(null)}>Continuar explorando <ArrowRight size={17}/></button></>:<div className="empty"><ShoppingBag size={40}/><h3>Um espaço para os seus desejos</h3><p>Sua sacola está esperando pelos seus favoritos.</p><button className="primary" onClick={()=>{setPanel(null);browse()}}>Explorar produtos <ArrowRight size={17}/></button></div>}</div>}
{panel==="product"&&selected&&<div className="product-detail"><Photo tile={selected.tile} label={selected.name}/><div><span className="eyebrow">{selected.category}</span><h2 id="dialog-title">{selected.name}</h2><p>{selected.detail}</p><div className="prices"><strong>{money(selected.price)}</strong>{selected.old&&<del>{money(selected.old)}</del>}</div><p>{selected.description || "Conheça os detalhes deste produto."}</p>{selected.isDemo && <span className="demo-pill">Produto demonstrativo</span>}<button className="primary full" disabled={selected.stock === 0} onClick={()=>add(selected)}>{selected.stock === 0 ? "Indisponível" : "Adicionar à sacola"} <ShoppingBag size={18}/></button><button className="text-link" onClick={()=>favorite(selected.id)}><Heart size={17} fill={favorites.includes(selected.id)?"currentColor":"none"}/>{favorites.includes(selected.id)?"Salvo nos favoritos":"Salvar nos favoritos"}</button></div></div>}
{panel==="info"&&<div className="info-panel"><Flower2 size={33}/><h2 id="dialog-title">{info.title}</h2><p>{info.text}</p><button className="primary" onClick={()=>setPanel(null)}>Entendi <ArrowRight size={17}/></button></div>}</dialog><div className={`toast ${toast?"visible":""}`} role="status" aria-live="polite"><BadgeCheck size={19}/>{toast}<button aria-label="Ver sacola" onClick={()=>{setPanel("cart");setToast("")}}>Ver sacola <ArrowRight size={15}/></button></div></>;
}
