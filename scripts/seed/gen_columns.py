import json, time, hashlib

def cid(seed):
    return 'col_' + hashlib.md5(seed.encode()).hexdigest()[:10]

now = "2026-06-17T01:30:00.000Z"
author = "kim-kyunghee"

columns = []

# ── 칼럼 1: 보존적 치료 = 쉬운 치료? 오해 바로잡기 ──
columns.append({
  "id": cid("conservative-myth"),
  "slug": "biomimetic-myth-conservative-is-easy",
  "title": "“덜 깎는 치료가 더 쉬운 치료다”라는 오해",
  "excerpt": "보존적인 접착수복이 크라운보다 쉽고 간단할 거라 생각하시는 분이 많습니다. 하지만 제대로 된 접착수복은 오히려 더 까다로운 원칙과 시간을 요구합니다. 그 이유를 설명드립니다.",
  "thumbnail": "/static/img/photos/treatment_03.jpg",
  "images": [],
  "authorSlug": author,
  "relatedTreatments": ["adhesive-restoration", "biomimetic"],
  "metaTitle": "보존적 치료가 더 쉽다는 오해 — 접착수복이 까다로운 이유 | 연세온치과",
  "metaDescription": "생체모방치의학 기반 접착수복(온레이·오버레이·레진)은 크라운보다 보존적이지만 더 까다롭습니다. 러버댐·접착 프로토콜이 필요한 이유를 보철과 전문의가 설명합니다.",
  "published": True,
  "createdAt": now,
  "updatedAt": now,
  "contentHtml": """
<p class="lead">진료실에서 환자분들께 가장 자주 듣는 오해 중 하나가 “더 보존적인 치료 = 더 쉬운 치료”라는 생각입니다. 결론부터 말씀드리면, 사실은 그 반대인 경우가 많습니다.</p>

<h2>보존적 치료란 무엇인가요?</h2>
<p>생체모방치의학(Biomimetic Dentistry)을 바탕으로 하는 치료는 대부분 <strong>직접·간접 접착수복</strong>입니다. 치아를 빙 둘러 깎아내는 크라운과 달리, 손상된 부분만 정밀하게 복원하기 때문에 자연치아의 구조를 더 많이 남길 수 있습니다. 분명히 크라운보다 보존적인 접근입니다.</p>

<h2>그런데 왜 더 까다로울까요?</h2>
<p>제대로 된 접착수복을 하려면 지켜야 할 원칙이 많습니다.</p>
<ul>
  <li><strong>러버댐 방습</strong> — 침과 수분을 완벽히 차단해야 접착이 제대로 됩니다.</li>
  <li><strong>접착 프로토콜 준수</strong> — 산부식, 프라이머, 본딩의 단계와 시간을 정석대로 지켜야 합니다.</li>
  <li><strong>정밀 인상</strong> — 경우에 따라 스캔이 아닌 러버 인상(rubber impression)을 진행합니다.</li>
</ul>
<p>이런 과정을 모두 지키다 보면, 환자분 입장에서는 크라운보다 오히려 <strong>입을 더 오래 벌리고 있어야 하고</strong>, 과정도 번거롭게 느껴질 수 있습니다.</p>

<h2>그럼에도 보존적 치료를 권하는 이유</h2>
<p>문헌상으로도 치아 구조를 보존하는 온레이·오버레이 등의 접착수복은 장기적인 예후 면에서 크라운보다 유리하다고 보고됩니다. 다만 치료를 직접 받는 환자 입장에서는 시간이 더 걸리고, 다소 힘든 과정일 수 있다는 점을 미리 알려드리고 싶습니다.</p>
<blockquote>치아의 보존을 위해, 나의 편의성을 어느 정도 양보해야 하는 치료법 — 그것이 보존적 치료의 솔직한 모습입니다.</blockquote>
<p>연세온치과는 번거롭더라도 지켜야 할 원칙을 지키는 치료를 선택합니다. 당장의 편의보다, 오래 쓰는 정직한 결과가 환자분께 더 이롭다고 믿기 때문입니다.</p>
"""
})

# ── 칼럼 2: 오버레이는 크라운의 한 종류가 아니다 ──
columns.append({
  "id": cid("overlay-not-crown"),
  "slug": "biomimetic-myth-overlay-is-not-a-crown-type",
  "title": "오버레이는 크라운의 ‘한 종류’가 아닙니다",
  "excerpt": "다른 병원에서 크라운 진단을 받고 치아를 이미 깎은 뒤, 오버레이로 바꾸고 싶어 찾아오시는 분들이 많습니다. 안타깝게도 그때는 이미 늦은 경우가 대부분입니다. 두 치료가 왜 근본적으로 다른지 설명드립니다.",
  "thumbnail": "/static/img/photos/consult_04.jpg",
  "images": [],
  "authorSlug": author,
  "relatedTreatments": ["adhesive-restoration", "esthetic-prosthetics"],
  "metaTitle": "오버레이와 크라운의 차이 — 오버레이는 크라운의 종류가 아닙니다 | 연세온치과",
  "metaDescription": "크라운 프렙이 된 치아는 오버레이가 사실상 불가능합니다. 법랑질 접착을 활용하는 오버레이와 크라운의 근본적 차이를 보철과 전문의가 설명합니다.",
  "published": True,
  "createdAt": now,
  "updatedAt": now,
  "contentHtml": """
<p class="lead">“다른 곳에서 크라운 진단을 받고 치아를 깎았는데, 오버레이로 바꾸고 싶어요.” 진료실에서 자주 듣는 말입니다. 안타깝지만, 이미 크라운 형태로 삭제된 치아는 오버레이로 되돌리기 어렵습니다.</p>

<h2>크라운과 오버레이는 삭제 형태가 완전히 다릅니다</h2>
<p>크라운은 치아를 기둥처럼 빙 둘러 깎아 그 위에 보철을 씌우는 방식입니다. 이 과정에서 치아의 <strong>법랑질(에나멜)이 대부분 사라집니다.</strong></p>
<p>반면 오버레이는 손상된 부위만 덮으면서, <strong>남아 있는 법랑질에 접착하는 힘</strong>을 최대한 활용하는 술식입니다. 즉, 법랑질이 살아 있어야 오버레이의 장점이 발휘됩니다.</p>

<h2>그래서 ‘순서’가 중요합니다</h2>
<p>이미 크라운을 위해 깎인(프렙된) 치아는 법랑질이 거의 남아 있지 않기 때문에, 그 위에 오버레이를 적용하는 것은 의미가 없습니다. 불가능에 가깝습니다.</p>
<blockquote>오버레이는 크라운의 한 종류가 아니라, 애초에 다른 치료법입니다.</blockquote>

<h2>치아를 깎기 전에 진단을 받으세요</h2>
<p>크라운 프렙을 하기 전에 진단을 먼저 받으셨다면, 더 보존적인 방법을 먼저 검토할 수 있었을 텐데 — 하는 아쉬운 경우를 자주 봅니다. 큰 치료를 결정하기 전, 한 번쯤 보존적 대안이 있는지 확인하시기를 권해 드립니다.</p>
"""
})

# ── 칼럼 3: 보존적 = 싼 치료? 공임에 대한 오해 ──
columns.append({
  "id": cid("conservative-not-cheap"),
  "slug": "biomimetic-myth-conservative-is-not-cheaper",
  "title": "“치아를 덜 깎는데 왜 더 비싸죠?”",
  "excerpt": "보존적인 치료라면 더 간단하고, 그래서 더 저렴할 거라 기대하시는 분들이 많습니다. 하지만 치아를 덜 깎는다고 해서 의사의 고민과 손이 덜 가는 것은 아닙니다.",
  "thumbnail": "/static/img/photos/treatment_07.jpg",
  "images": [],
  "authorSlug": author,
  "relatedTreatments": ["adhesive-restoration", "biomimetic"],
  "metaTitle": "보존적 치료가 더 비싼 이유 — 접착수복의 공임에 대하여 | 연세온치과",
  "metaDescription": "치아를 덜 깎는 접착수복(레진·온레이·오버레이)이 크라운보다 저렴해야 한다는 오해를 풀어드립니다. 접착수복에 더 많은 손과 시간이 드는 이유.",
  "published": True,
  "createdAt": now,
  "updatedAt": now,
  "contentHtml": """
<p class="lead">“더 보존적이라면서, 치아를 덜 깎는다면서 치료비가 왜 이렇게 비싸요?” — 충분히 가질 수 있는 의문입니다. 보존적 = 간단 = 저렴, 이렇게 연결해서 생각하기 쉽기 때문입니다.</p>

<h2>덜 깎는다고 손이 덜 가는 것은 아닙니다</h2>
<p>접착수복(레진 빌드업, 인레이, 온레이, 오버레이)은 치아를 크게 깎지 않는 대신, 그 자리에 더 많은 <strong>정밀함과 시간</strong>을 요구합니다.</p>
<ul>
  <li>러버댐을 걸고, 접착 단계를 하나하나 지켜야 합니다.</li>
  <li>위생사와 의사의 손이 더 많이 들어갑니다.</li>
  <li>형태를 자연치아에 가깝게 다듬는 과정에 더 많은 고민이 필요합니다.</li>
</ul>

<h2>‘덜 깎는 것’의 진짜 가치</h2>
<p>치아를 덜 깎는다는 것은, 환자분의 소중한 자연치아를 더 많이 남긴다는 뜻입니다. 그 자연치아는 한 번 잃으면 되돌릴 수 없습니다. 보존적 치료의 비용은 ‘재료를 덜 쓰는 값’이 아니라, <strong>자연치아를 지키기 위한 정밀함의 값</strong>입니다.</p>
<blockquote>덜 깎는 치료가, 결코 덜 정성스러운 치료는 아닙니다.</blockquote>
<p>연세온치과는 환자분이 이 차이를 충분히 이해하실 수 있도록, 무엇을 왜 하는지 명확하게 설명드리는 것을 원칙으로 합니다.</p>
"""
})

for col in columns:
    with open(f"/tmp/columns/{col['id']}.json", "w", encoding="utf-8") as f:
        json.dump(col, f, ensure_ascii=False)
    print(col['id'], col['slug'])

# build index (newest first)
index = [{"id": c["id"], "slug": c["slug"], "title": c["title"], "createdAt": c["createdAt"], "published": c["published"]} for c in columns]
with open("/tmp/columns/_index.json", "w", encoding="utf-8") as f:
    json.dump(index, f, ensure_ascii=False)
print("index:", len(index), "columns")
